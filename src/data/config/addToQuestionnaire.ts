import type { PromData } from "@data/mapping/types";
import type { Mapping } from "@data/globalTypes";
import { addDimensionToQuestionnaireItems, 
    addRangeAndScoreHealthCorrelationToQuestionnaireScoreItems, 
    addShortNamesToQuestionnaireItems } from "./utils";

export const addConfigurationsToQuestionnaire = 
    (questionnaire: PromData.Questionnaire, 
        observationDefinitions: PromData.ObservationDefinition[], 
        config: any): Mapping.Result<PromData.Questionnaire> => {
    const issues: Mapping.DataIssue[] = [];

    /**
     * 1. Dimension
     * 2. Score attributes
     * 3. Item short names
     */
    const questionnaireWithConfigSettings = questionnaire;
    const questionnaireItemsWithDimension = addDimensionToQuestionnaireItems(questionnaireWithConfigSettings, config);
    questionnaireWithConfigSettings.items = questionnaireItemsWithDimension;
    const questionnaireItemsWithScoreAttributesAndErrorMessages = addRangeAndScoreHealthCorrelationToQuestionnaireScoreItems(questionnaireWithConfigSettings, observationDefinitions, config);
    questionnaireWithConfigSettings.items = questionnaireItemsWithScoreAttributesAndErrorMessages.data;
    questionnaireItemsWithScoreAttributesAndErrorMessages.issues.forEach((issue) => {
        issues.push(issue);
    })
    const questionnaireItemsWithShortNamesAndErrorMessages = addShortNamesToQuestionnaireItems(questionnaireWithConfigSettings, config);
    questionnaireWithConfigSettings.items = questionnaireItemsWithShortNamesAndErrorMessages.data;
    questionnaireItemsWithShortNamesAndErrorMessages.issues.forEach((issue) => {
        issues.push(issue);
    });

    return {
        data: questionnaireWithConfigSettings,
        issues: issues
    }

}