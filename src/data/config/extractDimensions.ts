// export const extractDimensionsFromConfig = (config: any): string[] => {
//     const dimensions: string[] = config.promConfiguration.questionnaireConfigurations.flatMap((elem: any) => {
//         const questionnaireDimensions = elem.dimensionMapping.map((dm:any) => dm.dimension);
//         return questionnaireDimensions;
//     });
//     return [...new Set(dimensions)];
// }

export const extractGlobalHealthDimensionsFromConfig = (config: any): string[] => {
    const globalDimensions: string[] = [];
    const  questionnaireConfigs = config.questionnaires;
    
    questionnaireConfigs.forEach((questionnaire: any) => {
        const questionnaireDimensions = questionnaire.dimensionItemMapping.filter((dim:any) => dim.isGlobalHealthDimension === true);
        globalDimensions.push(...questionnaireDimensions.map((dim:any) => dim.dimension));
    });
    return [... new Set(globalDimensions)];
}