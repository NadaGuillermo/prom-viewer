export const extractDomainsFromConfig = (config: any): string[] => {
     const domains: string[] = [];
     
     config.questionnaires.forEach((questionnaire: any) => {
        const questionnaireDomains = questionnaire.domainItemMapping.map((dom: any) => dom.domain);
        domains.push(...questionnaireDomains);
     });
    return [...new Set(domains)];
}

export const extractGlobalHealthDimensionsFromConfig = (config: any): string[] => {
    const globalDimensions: string[] = [];
    
    config.questionnaires.forEach((questionnaire: any) => {
        const questionnaireDomains = questionnaire.domainItemMapping.filter((dom:any) => dom.isGlobalHealthDimension === true);
        globalDimensions.push(...questionnaireDomains.map((dom:any) => dom.domain));
    });
    return [... new Set(globalDimensions)];
}