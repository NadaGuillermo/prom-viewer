import type { NormalizedFHIR } from "./types";
import { extractLinkIdsFromFhirPath } from "./helpers";
import { QUESTIONNAIRE_ITEM_TYPES_TO_BE_IGNORED } from "./constants";
import type { Mapping } from "@data/globalTypes";

export const normalizeQuestionnaire = (
  resource: any,
): Mapping.Result<NormalizedFHIR.Questionnaire> => {
  const items: Record<string, NormalizedFHIR.QuestionnaireItem> = {};
  const issues: Mapping.DataIssue[] = [];

const extractAnswerOptions = (
    item: any,
  ): NormalizedFHIR.AnswerOption[] => {
    let answerOptions: any[] = [];

    if (item.answerOption) {
      answerOptions = item.answerOption.map((opt: any) => {
        const display = opt.valueCoding?.display;
        let value: any;
        // search for extension with value
        const extension = opt.extension?.find((ext: any) => {
          return ext.valueDecimal !== undefined || ext.valueInteger !== undefined || ext.valueString !== undefined || ext.valueBoolean !== undefined || ext.valueDate !== undefined || ext.valueDateTime !== undefined || ext.valueTime !== undefined;
        });
        if (extension !== undefined) {
          value = extension.valueDecimal ??
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
      const answerValueSet = resource.contained?.find((containedObj: any) => {
        return (
          containedObj.resourceType === "ValueSet" &&
          containedObj.id === item.answerValueSet.replace("#", "")
        );
      });
      const codeSystemArray = resource.contained?.find((containedObj: any) => {
        return containedObj.resourceType === "CodeSystem";
      })?.concept;
      if (answerValueSet !== undefined && codeSystemArray !== undefined) {
        const answerValueSetArray = answerValueSet.compose?.include?.find(
          (includedObj: any) => {
            return includedObj.concept?.length > 0;
          },
        )?.concept;

        if (answerValueSetArray !== undefined) {
          answerOptions = answerValueSetArray.map((answerVal: any) => {
            const codeValue = codeSystemArray
              .find((elem: any) => {
                return elem.code === answerVal.code;
              })
              .extension?.find(
                (ext: any) => ext.valueDecimal !== undefined,
              ).valueDecimal;
            return {
              value: codeValue,
              label: answerVal.display ?? answerVal.code,
              code: answerVal.code,
            };
          });
        }
      }
    }
    return answerOptions;
  };

  const extractReferenceQuestionnaireItems = (
    item: any,
  ) => {
    let referenceQuestionnaireItems: string[] = [];

    let calculationFormula = item.extension?.find((ext: any) => {
      return ext.valueExpression?.expression !== undefined;
    })?.valueExpression.expression;

    if (calculationFormula !== undefined) {
      // check if calculationFormula is only a reference
      if (calculationFormula.charAt(0) === "%") {
        // try to find in resource
        const valueExpressions = resource.extension?.filter((ext: any) => ext.valueExpression?.expression !== undefined);
        if (valueExpressions !== undefined) {
          const expressionReference = calculationFormula;
          for (const valueEx of valueExpressions) {
            if (expressionReference.includes(valueEx.valueExpression.name)) {
              calculationFormula = valueEx.valueExpression.expression;
              break;
            }
          }
        }
      }
      const referencedLinkIds = extractLinkIdsFromFhirPath(
        calculationFormula
      );
      if (referencedLinkIds.includes(item.linkId)) {
        referencedLinkIds.splice(referencedLinkIds.indexOf(item.linkId))
      }
      referenceQuestionnaireItems.push(...referencedLinkIds);
    }

    return referenceQuestionnaireItems.length > 0 ? referenceQuestionnaireItems : undefined;
  };

  const extractRange = (item: any): [number, number] | undefined => {
    const extensionMinVal = item.extension?.find((ext: any) => ext.url?.includes("minValue"));
    const extensionMaxVal = item.extension?.find((ext: any) => ext.url?.includes("maxValue"));

    if (extensionMinVal === undefined || extensionMaxVal === undefined) {
      return undefined;
    }
    const low = extensionMinVal.valueDecimal ??
      extensionMinVal.valueInteger ??
      extensionMinVal.valueDecimal ??
      extensionMinVal.valueString ??
      extensionMinVal.valueBoolean ??
      extensionMinVal.valueDate ??
      extensionMinVal.valueDateTime ??
      extensionMinVal.valueTime ??
      undefined;
    
    const high = extensionMaxVal.valueDecimal ??
      extensionMaxVal.valueInteger ??
      extensionMaxVal.valueDecimal ??
      extensionMaxVal.valueString ??
      extensionMaxVal.valueBoolean ??
      extensionMaxVal.valueDate ??
      extensionMaxVal.valueDateTime ??
      extensionMaxVal.valueTime ??
      undefined;

    if (low !== undefined && high !== undefined) {
      return [low, high];
    }
    return undefined;
  }

  const traverse = (
    itemsInput: any[] | undefined,
  ) => {
    if (!itemsInput) return;

    for (const item of itemsInput) {
      // ignore all items with certain types      
      if (QUESTIONNAIRE_ITEM_TYPES_TO_BE_IGNORED.includes(item.type)) { // type immer gegeben
        continue;
      }
      const referenceQuestionnaires = extractReferenceQuestionnaireItems(item);
      const itemValueRange = extractRange(item);
      
      items[item.linkId] = {
        linkId: item.linkId, // immer gegeben
        text: item.text, // optional
        answerOptions: extractAnswerOptions(item),
        ...(referenceQuestionnaires !== undefined && {referenceQuestionnaireItems: referenceQuestionnaires}),
        ...(itemValueRange !== undefined && {range: itemValueRange}),
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
    id: resource.id, // sollte immer gegeben sein
    name: resource.title, // optional
    url: resource.url, // immer gegeben
    description: resource.description, // optional
    items, // optional
    },
    issues
  };
};