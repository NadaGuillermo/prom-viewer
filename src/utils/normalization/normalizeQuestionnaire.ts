import type { Questionnaire, QuestionnaireItem, ValueSet, CodeSystem } from "fhir/r4";

import type { NormalizedFHIR } from "./types";
import { extractLinkIdsFromFhirPath } from "./helpers";
import { QUESTIONNAIRE_ITEM_TYPES_TO_BE_IGNORED } from "./constants";
import { type Errors } from "@utils/errors";

export const normalizeQuestionnaire = (
  resource: Questionnaire,
): Errors.Result<NormalizedFHIR.Questionnaire> => {
  const items: Record<string, NormalizedFHIR.QuestionnaireItem> = {};
  const issues: Errors.DataIssue[] = [];

  const extractAnswerOptions = (item: QuestionnaireItem): NormalizedFHIR.AnswerOption[] => {
    const answerOptions: NormalizedFHIR.AnswerOption[] = [];

    // Option 1: answer options stored in answerOption attribute
    if (item.answerOption && item.answerOption.length > 0) {
      for (const opt of item.answerOption) {
        const value = opt.valueInteger ?? opt.valueString;
        // only value exists for answer option
        if (value !== undefined && opt.initialSelected === false) { // otherwise error with EQ-5D-5L
          answerOptions.push(
            {
            value: value,
          });
          continue;
        }

        // check if value is part of coding system
        if (opt.valueCoding) {
          const code = opt.valueCoding.code;
          const label = opt.valueCoding.display;
          const valueExtension = opt.extension?.find((ext) => ext.url === "http://hl7.org/fhir/StructureDefinition/ordinalValue");
          const value = valueExtension?.valueDecimal ?? valueExtension?.valueInteger ?? valueExtension?.valueString ?? valueExtension?.valueBoolean;
          if (code !== undefined) {
            answerOptions.push({
              code: code,
              label: label,
              value: value,
            })
          }
        }
      }
      // Option 2: answer options are stored in seperate resource of type ValueSet
    } else if (item.answerValueSet) {
      const answerValueSet = resource.contained?.find(
        (containedObj): containedObj is ValueSet => {
          return (
            containedObj.resourceType === "ValueSet" &&
            containedObj.id === item.answerValueSet?.replace("#", "")
          );
        },
      );
      const valueSetConcept = answerValueSet?.compose?.include.find((vsc) => vsc.system?.includes("CodeSystem"))?.concept;
      const codeSystem = resource.contained?.find((resource) => resource.resourceType === "CodeSystem") as (CodeSystem | undefined);
      const codes = valueSetConcept?.map((valset) => valset.code);
      if (valueSetConcept !== undefined && codes !== undefined) {
        if (codeSystem !== undefined && codeSystem.concept !== undefined) {
          const codeLabelValueRecord: Record<string, {label?: string, value?: NormalizedFHIR.Value}> = {};
          for (const valSet of valueSetConcept) {
            const code = valSet.code;
            const label = valSet.display;
            if (code !== undefined) {
              codeLabelValueRecord[code] = {label: label};
            }
          }
          const codeSystemConcepts = codeSystem.concept;
          Object.keys(codeLabelValueRecord).forEach((code) => {
            const valueExtension = codeSystemConcepts.find((concept) => concept.code === code)?.extension?.find((ext) => ext.url === "http://hl7.org/fhir/StructureDefinition/ordinalValue");
            const value = valueExtension?.valueDecimal ?? valueExtension?.valueInteger ?? valueExtension?.valueString ?? valueExtension?.valueBoolean;
            codeLabelValueRecord[code] = {...codeLabelValueRecord[code], value: value}
          })
          Object.entries(codeLabelValueRecord).forEach(([key, val]) => {
            answerOptions.push({
              code: key,
              label: val.label,
              value: val.value,
            })
          })
      } else {
        valueSetConcept.forEach((valset) => {
          answerOptions.push({
            code: valset.code,
            label: valset.display
          })
        })
      }
      }
    }
    return answerOptions; // can be empty
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

  const extractRange = (item: QuestionnaireItem): NormalizedFHIR.Range | undefined => {
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
      extensionMinVal.valueString ??
      extensionMinVal.valueBoolean;

    const high =
      extensionMaxVal.valueDecimal ??
      extensionMaxVal.valueInteger ??
      extensionMaxVal.valueString ??
      extensionMaxVal.valueBoolean;

    if (low !== undefined && high !== undefined) {
      return [low, high];
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
        answerOptions: itemAnswerOptions.length > 0 ? itemAnswerOptions : undefined,
        text: item.text,
        referenceQuestionnaireItems: referenceQuestionnaireItems,
        range: itemValueRange,
        scoreExpression: scoreExpression,
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
      url: resource.url!, // immer gegeben
      title: resource.title, // optional
      // description: resource.description, // optional
      items, // optional
    },
    issues: issues,
  };
};
