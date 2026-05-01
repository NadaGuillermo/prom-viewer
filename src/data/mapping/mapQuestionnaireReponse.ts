import type { NormalizedFHIR } from "@data/fhir";
import type { PromData } from "@data/mapping/types";
import { convertFhirDateTimeToDateFormat } from "./helpers";
import type { Mapping } from "@data/globalTypes";

export const mapNormalizedQuestionnaireResponseToPromDataQuestionnaireResponse =
  (
    questionnaireResponse: NormalizedFHIR.QuestionnaireResponse,
    questionnaires: PromData.Questionnaire[],
  ): Mapping.Result<PromData.QuestionnaireResponse> => {
    const responseId = questionnaireResponse.id;
    const questionnaireUrl = questionnaireResponse.questionnaire;
    const authored = convertFhirDateTimeToDateFormat(
      questionnaireResponse.authored,
    );
    const items: Record<string, PromData.ResponseItem> = {};
    const issues: Mapping.DataIssue[] = [];

    // Potential errors: no items in questionnaireResponse, answer not convertible to number, questionnaire reference invalid

    // Error: no items in questionnaireResponse
    if (
      questionnaireResponse.items === undefined ||
      Object.keys(questionnaireResponse.items).length === 0
    ) {
      issues.push({
        id: `issue-questionnaireResponse-${responseId}-${Math.random().toString(36).substring(2, 9)}`,
        level: "warning",
        message: `QuestionnaireResponse with id ${responseId} has no items and is therefore omitted.`,
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
          id: `issue-questionnaireResponse-${responseId}-item-${linkId}-${Math.random().toString(36).substring(2, 9)}`,
          level: "error",
          message: `Answer for item with linkId ${linkId} in QuestionnaireResponse ${responseId} could not be converted or mapped to a number. Answer was: ${answer}`,
        });
      }
    });

    const correspondingQuestionnaire = questionnaires.find(
      (q) => q.url === questionnaireUrl,
    );

    // Error: invalid questionnaire reference
    if (correspondingQuestionnaire === undefined) {
      issues.push({
        id: `issue-questionnaireResponse-${responseId}-questionnaire-${questionnaireUrl}-${Math.random().toString(36).substring(2, 9)}`,
        level: "error",
        message: `QuestionnaireResponse with id ${responseId} references non-existing questionnaire with url ${questionnaireUrl} and is therefore omitted.`,
      });
    }
    const emptyQuestionnaire: PromData.Questionnaire = {
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
      issues,
    };
  };
