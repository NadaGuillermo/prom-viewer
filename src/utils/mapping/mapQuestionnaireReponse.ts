import type { NormalizedFHIR } from "@utils/fhir";
import type { Mapping } from "./types";
import { convertFhirDateTimeToDateFormat } from "./helpers";
import { issueFactories, type Errors } from "@utils/errors";
import { isQuestionnaireItem } from "./utils";

export const mapNormalizedQuestionnaireResponseToPromDataQuestionnaireResponse =
  (
    questionnaireResponse: NormalizedFHIR.QuestionnaireResponse,
    questionnaires: Mapping.Questionnaire[],
  ): Errors.Result<Mapping.QuestionnaireResponse> => {
    const responseId = questionnaireResponse.id;
    const questionnaireUrl = questionnaireResponse.questionnaire;
    const authored = convertFhirDateTimeToDateFormat(
      questionnaireResponse.authored,
    );
    const items: Record<string, Mapping.ResponseItem> = {};
    const issues: Errors.DataIssue[] = [];

    // Potential errors: no items in questionnaireResponse, answer not convertible to number,
    // questionnaire reference invalid

    // Error: no items in questionnaireResponse
    if (
      questionnaireResponse.items === undefined ||
      Object.keys(questionnaireResponse.items).length === 0
    ) {
      issues.push(issueFactories.questionnaireResponse.missingItems(questionnaireResponse));
    }
    const correspondingQuestionnaire = questionnaires.find(
      (q) => q.url === questionnaireUrl,
    );

    Object.entries(questionnaireResponse.items).forEach(([linkId, item]) => {
      const answer = item.answer;
      const answerNumber = Number(answer);
      let answerShouldBeNull = false;

      if(answer === null) {
        answerShouldBeNull = true;
      }

      // Error: answer is not a number
      if (Number.isNaN(answerNumber)) {
        issues.push(issueFactories.questionnaireResponse.invalidItemValueType(questionnaireResponse, linkId, answer));
        answerShouldBeNull = true;
      }

      // Error: answer not in answerOptions
      if (correspondingQuestionnaire && isQuestionnaireItem(correspondingQuestionnaire.items[linkId])) {
        const answerOptionsValues = (correspondingQuestionnaire?.items[linkId] as Mapping.QuestionnaireItem).answerOptions.map((opt) => opt.value);
        if (!answerOptionsValues.includes(answerNumber)) {
          issues.push(issueFactories.questionnaireResponse.invalidItemValue(questionnaireResponse, linkId, answer));
          answerShouldBeNull = true;
        }
      }

      items[linkId] = {
        linkId: linkId,
        answer:
          answerShouldBeNull ? null : answerNumber,
      };
    });

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
