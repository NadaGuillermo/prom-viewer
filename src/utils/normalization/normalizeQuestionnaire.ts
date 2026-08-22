import type { Questionnaire, QuestionnaireItem, ValueSet, CodeSystem } from "fhir/r4";

import type { NormalizedFHIR } from "./types";
import { extractLinkIdsFromFhirPath } from "./helpers";
import { QUESTIONNAIRE_ITEM_TYPES_TO_BE_IGNORED } from "./constants";
import { type Errors } from "@utils/errors";

type RawAnswerOption = {
  value: NormalizedFHIR.Answer | undefined;
  label: string | undefined;
  code: string | undefined;
};

export const normalizeQuestionnaire = (
  resource: Questionnaire,
): Errors.Result<NormalizedFHIR.Questionnaire> => {
  const items: Record<string, NormalizedFHIR.QuestionnaireItem> = {};
  const issues: Errors.DataIssue[] = [];

  const extractAnswerOptions = (item: QuestionnaireItem): NormalizedFHIR.AnswerOption[] | undefined => {
    let answerOptions: RawAnswerOption[] | undefined = undefined;

    if (item.answerOption) {
      answerOptions = item.answerOption.map((opt) => {
        // omit preselected answer option
        const initialSelected = opt.initialSelected;
        if (initialSelected) {
          return {
            value: undefined,
            label: undefined,
            code: undefined,
          };
        }
        const display = opt.valueCoding?.display;
        let value: NormalizedFHIR.Answer | undefined;
        // search for extension with value
        const extension = opt.extension?.find((ext) => {
          return (
            ext.valueDecimal !== undefined ||
            ext.valueInteger !== undefined ||
            ext.valueString !== undefined ||
            ext.valueBoolean !== undefined ||
            ext.valueDate !== undefined ||
            ext.valueDateTime !== undefined ||
            ext.valueTime !== undefined
          );
        });
        if (extension !== undefined) {
          value =
            extension.valueDecimal ??
            extension.valueInteger ??
            extension.valueString ??
            extension.valueBoolean ??
            extension.valueDate ??
            extension.valueDateTime ??
            extension.valueTime ??
            undefined; // will be sorted out in mapping step
        } else if (opt.valueCoding !== undefined) {
          value = opt.valueCoding.code; // Code, manchmal auch Wert
        } else {
          value = undefined; // sorted out in mapping
        }
        return {
          value: value,
          label: display,
          code: opt.valueCoding?.code, // ist Code <=> code !== undefined && code !== value
        };
      });
    } else if (item.answerValueSet) {
      // answerValueSet instead
      const answerValueSet = resource.contained?.find(
        (containedObj): containedObj is ValueSet => {
          return (
            containedObj.resourceType === "ValueSet" &&
            containedObj.id === item.answerValueSet?.replace("#", "")
          );
        },
      );
      const codeSystemArray = resource.contained?.find(
        (containedObj): containedObj is CodeSystem => {
          return containedObj.resourceType === "CodeSystem";
        },
      )?.concept;
      if (answerValueSet !== undefined && codeSystemArray !== undefined) {
        const answerValueSetArray = answerValueSet.compose?.include?.find(
          (includedObj) => {
            return (includedObj.concept?.length ?? 0) > 0;
          },
        )?.concept;

        if (answerValueSetArray !== undefined) {
          answerOptions = answerValueSetArray.map((answerVal) => {
            const codeValue = codeSystemArray
              .find((elem) => {
                return elem.code === answerVal.code;
              })
              ?.extension?.find(
                (ext) => ext.valueDecimal !== undefined,
              )?.valueDecimal;
            return {
              value: codeValue,
              label: answerVal.display ?? answerVal.code,
              code: answerVal.code,
            };
          });
        }
      }
    }
    return answerOptions as NormalizedFHIR.AnswerOption[] | undefined; // can be empty
  };

  const extractReferenceQuestionnaireItemsAndScoreExpression = (item: QuestionnaireItem): {
    referenceQuestionnaireItems: string[] | undefined;
    scoreExpression: string | undefined;
  } => {
    const referenceQuestionnaireItems: string[] = [];
    let scoreExpression: string | undefined = undefined;
    let calculationFormula = item.extension?.find((ext) =>
      ext.url === "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression"
    )?.valueExpression?.expression;

    if (calculationFormula !== undefined) {
      // check if calculationFormula is only a reference
      if (calculationFormula.charAt(0) === "%") {
        // try to find in resource
        const valueExpressions = resource.extension?.filter(
          (ext) => ext.valueExpression?.expression !== undefined,
        );
        if (valueExpressions !== undefined) {
          const expressionReference = calculationFormula;
          for (const valueEx of valueExpressions) {
            if (
              valueEx.valueExpression?.name !== undefined &&
              expressionReference.includes(valueEx.valueExpression.name)
            ) {
              calculationFormula = valueEx.valueExpression.expression ?? calculationFormula;
              break;
            }
          }
        }
      }
      const referencedLinkIds = extractLinkIdsFromFhirPath(calculationFormula);
      if (referencedLinkIds.includes(item.linkId)) {
        referencedLinkIds.splice(referencedLinkIds.indexOf(item.linkId));
      }
      referenceQuestionnaireItems.push(...referencedLinkIds);
      scoreExpression = calculationFormula;
    }

    return {
      referenceQuestionnaireItems: referenceQuestionnaireItems.length > 0
      ? referenceQuestionnaireItems
      : undefined,
      scoreExpression: scoreExpression
    }
  };

  const extractRange = (item: QuestionnaireItem): [number, number] | undefined => {
    const extensionMinVal = item.extension?.find((ext) =>
      ext.url === "http://hl7.org/fhir/StructureDefinition/minValue",
    );
    const extensionMaxVal = item.extension?.find((ext) =>
      ext.url === "http://hl7.org/fhir/StructureDefinition/maxValue",
    );

    if (extensionMinVal === undefined || extensionMaxVal === undefined) {
      return undefined;
    }
    const low =
      extensionMinVal.valueDecimal ??
      extensionMinVal.valueInteger ??
      extensionMinVal.valueDecimal ??
      extensionMinVal.valueString ??
      extensionMinVal.valueBoolean ??
      extensionMinVal.valueDate ??
      extensionMinVal.valueDateTime ??
      extensionMinVal.valueTime ??
      undefined;

    const high =
      extensionMaxVal.valueDecimal ??
      extensionMaxVal.valueInteger ??
      extensionMaxVal.valueDecimal ??
      extensionMaxVal.valueString ??
      extensionMaxVal.valueBoolean ??
      extensionMaxVal.valueDate ??
      extensionMaxVal.valueDateTime ??
      extensionMaxVal.valueTime ??
      undefined;

    if (low !== undefined && high !== undefined) {
      return [low, high] as [number, number];
    }
    return undefined;
  };

  const traverse = (itemsInput: QuestionnaireItem[] | undefined) => {
    if (!itemsInput) return;

    for (const item of itemsInput) {
      // ignore all items with certain types
      if (QUESTIONNAIRE_ITEM_TYPES_TO_BE_IGNORED.includes(item.type)) {
        // type immer gegeben
        continue;
      }
      const {referenceQuestionnaireItems, scoreExpression} = extractReferenceQuestionnaireItemsAndScoreExpression(item);
      const itemValueRange = extractRange(item);
      const itemAnswerOptions = extractAnswerOptions(item);

      items[item.linkId] = {
        linkId: item.linkId, // immer gegeben
        text: item.text!, // optional
        ...(itemAnswerOptions !== undefined && {answerOptions: itemAnswerOptions}),
        ...(referenceQuestionnaireItems !== undefined && {
          referenceQuestionnaireItems: referenceQuestionnaireItems,
        }),
        ...(itemValueRange !== undefined && { range: itemValueRange }),
        ...(scoreExpression !== undefined && {
          scoreExpression: scoreExpression,
        }),
      };

      if (item.item) {
        traverse(item.item);
      }
    }
  };

  // const extractLinkIds = (itemsInput: any[] | undefined, linkIds: string[]) => {
  //   if (!itemsInput) return;
  //   const itemLinkIds = linkIds;

  //   for (const item of itemsInput) {
  //     itemLinkIds.push(item.linkId);

  //     if (item.item) {
  //       extractLinkIds(item.item, itemLinkIds);
  //     }
  //   }
  //   return itemLinkIds;
  // };

  // const itemLinkIds: string[] | undefined = extractLinkIds(resource.item, []);
  // console.log("Item Link Ids from FHIR: ", itemLinkIds);

  traverse(resource.item);

  return {
    data: {
      id: resource.id!, // sollte immer gegeben sein
      name: resource.title!, // optional
      url: resource.url!, // immer gegeben
      description: resource.description!, // optional
      items, // optional
    },
    issues: issues,
  };
};
