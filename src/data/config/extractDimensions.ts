// export const extractDimensionsFromConfig = (config: any): string[] => {
//     const dimensions: string[] = config.promConfiguration.questionnaireConfigurations.flatMap((elem: any) => {
//         const questionnaireDimensions = elem.dimensionMapping.map((dm:any) => dm.dimension);
//         return questionnaireDimensions;
//     });
//     return [...new Set(dimensions)];
// }

export const extractGlobalHealthDimensionsFromConfig = (config: any): string[] => {
    const globalDimensions: string[] = [];
    const  questionnaireConfigs = config.promConfiguration.questionnaireConfigurations;
    
    questionnaireConfigs.forEach((questionnaire: any) => {
        const questionnaireDimensions = questionnaire.dimensionMapping.filter((dm:any) => dm.globalHealth);
        globalDimensions.push(...questionnaireDimensions.map((dm:any) => dm.dimension));
    });
    return [... new Set(globalDimensions)];
}