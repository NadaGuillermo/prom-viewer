
export const extractQuestionnairesFromConfig = (config: any): string[] => {
    const questionnaires: string[] = config.promConfiguration.questionnaireConfigurations.map((elem: any) => elem.questionnaire);
    return [...new Set(questionnaires)];
}