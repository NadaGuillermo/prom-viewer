import type { NormalizedFHIR } from "@data/fhir";
import type { PromData } from "@customTypes/promData";
import { convertFhirDateTimeToDateFormat } from "./helpers";

export const mapQuestionnaireResponses = (questionnaireResponse: NormalizedFHIR.QuestionnaireResponse, questionnaires: PromData.Questionnaire[]): PromData.QuestionnaireResponse => {
    const id = questionnaireResponse.id;
    const questionnaireUrl = questionnaireResponse.questionnaire;
    const authored = convertFhirDateTimeToDateFormat(questionnaireResponse.authored);
    const items: Record<string, PromData.ResponseItem> = {};

    Object.entries(questionnaireResponse.items).forEach(([linkId, item]) => {
        const answer = item.answer;
        items[linkId] = {
            linkId: linkId,
            answer: answer === null ? answer: Number(answer), // TODO needs to be number or null
        };
    });

    const correspondingQuestionnaire = questionnaires.filter((q) => q.url === questionnaireUrl)[0];

    return {
        id: id,
        questionnaire: correspondingQuestionnaire,
        authored: authored,
        items: items, // kann leer sein
    };
}