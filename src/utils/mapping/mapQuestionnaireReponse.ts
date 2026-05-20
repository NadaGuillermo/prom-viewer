import type { NormalizedFHIR } from "@utils/fhir";
import type { Mapping } from "./types";
import { convertFhirDateTimeToDateFormat } from "./helpers";
import type { GlobalTypes } from "@customTypes/globalTypes";

export const mapNormalizedQuestionnaireResponseToPromDataQuestionnaireResponse =
  (
    questionnaireResponse: NormalizedFHIR.QuestionnaireResponse,
    questionnaires: Mapping.Questionnaire[],
  ): GlobalTypes.Result<Mapping.QuestionnaireResponse> => {
    const responseId = questionnaireResponse.id;
    const questionnaireUrl = questionnaireResponse.questionnaire;
    const authored = convertFhirDateTimeToDateFormat(
      questionnaireResponse.authored,
    );
    const items: Record<string, Mapping.ResponseItem> = {};
    const issues: GlobalTypes.DataIssue[] = [];

    // Potential errors: no items in questionnaireResponse, answer not convertible to number,
    // questionnaire reference invalid

    // Error: no items in questionnaireResponse
    if (
      questionnaireResponse.items === undefined ||
      Object.keys(questionnaireResponse.items).length === 0
    ) {
      issues.push({
        id: `issue-questionnaireResponse-${Math.random().toString(36).substring(2, 9)}`,
        level: "error",
        message: `QuestionnaireResponse with id ${responseId} has no items and is therefore omitted.`,
        resourceId: responseId,
        resourceType: "QuestionnaireResponse",
        linkId: undefined,
      });
    }
    Object.entries(questionnaireResponse.items).forEach(([linkId, item]) => {
      const answer = item.answer;

      // Error: answer is not a number
      const answerNumber = Number(answer);

      items[linkId] = {
        linkId: linkId,
        answer:
          answer === null || Number.isNaN(answerNumber) ? null : Number(answer),
      };
      if (Number.isNaN(answerNumber)) {
        issues.push({
          id: `issue-questionnaireResponse-item-${Math.random().toString(36).substring(2, 9)}`,
          level: "error",
          message: `Answer for item with linkId ${linkId} in QuestionnaireResponse with Id ${responseId} 
            could not be converted or mapped to a number and is therefore omitted. Answer was: ${answer}.`,
          resourceId: responseId,
          resourceType: "QuestionnaireResponse",
          linkId: linkId,
        });
      }
    });

    const correspondingQuestionnaire = questionnaires.find(
      (q) => q.url === questionnaireUrl,
    );

    // Error: invalid questionnaire reference
    // never the case since filtered after normalization
    // if (correspondingQuestionnaire === undefined) {
    //   issues.push({
    //     id: `issue-questionnaireResponse-questionnaire-${Math.random().toString(36).substring(2, 9)}`,
    //     level: "error",
    //     message: `QuestionnaireResponse with id ${responseId} references non-existing questionnaire 
    //       with url ${questionnaireUrl} and is therefore omitted.`,
    //     resourceId: responseId,
    //     resourceType: "QuestionnaireResponse",
    //     linkId: undefined,
    //   });
    // }
    const emptyQuestionnaire: Mapping.Questionnaire = {
      id: "",
      name: "",
      url: "",
      description: "",
      items: {},
    };

    return {
      data: {
        id: responseId,
        questionnaire: correspondingQuestionnaire ?? emptyQuestionnaire,
        authored: authored,
        items: items, // kann leer sein, dann nicht verwenden
      },
      issues: issues,
    };
  };
