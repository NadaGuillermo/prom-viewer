
export const extractQuestionnairesFromConfig = (config: any): string[] => {
    const questionnaires: string[] = config.questionnaires.map((q: any) => q.questionnaire);
    return [...new Set(questionnaires)];
}