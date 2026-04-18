import type { NormalizedFHIR } from "@data/fhir";
import type { PromData } from "@customTypes/promData";

export const mapQuestionnaire = (questionnaire: NormalizedFHIR.Questionnaire): PromData.Questionnaire => {
    const id = questionnaire.id;
    const name = questionnaire.name;
    const url = questionnaire.url;
    const description = questionnaire.description;
    const items: Record<string, PromData.Item> = {};

    Object.entries(questionnaire.items).forEach(([linkId, item]) => {
        const text = item.text;
        const answerOptions = item.answerOptions.map((opt) => {
            return {
                value: Number(opt.value), // TODO needs to be number what if transformation goes wrong (e.g. opt.value = null)
                label: opt.label,
            };
        });
        const dimension = "";
        const range = item.range;
        const scoreHealthCorrelation = item.scoreHealthCorrelation;
        const referenceQuestionnaireItems = item.referenceQuestionnaireItems;
        items[linkId] = {
            linkId: linkId,
            text: text, // kann undefined sein
            answerOptions: answerOptions,
            dimension: dimension,
            ...(range !== undefined && {range: range}),
            ...(scoreHealthCorrelation !== undefined && {scoreHealthCorrelation: scoreHealthCorrelation}),
            ...(referenceQuestionnaireItems !== undefined && {referenceQuestionnaireItems: referenceQuestionnaireItems}),
        }
    });

    return {
        id: id,
        name: name, // kann undefined sein
        url: url,
        description: description, // kann undefined sein
        items: items, // kann leer sein
    }  
};