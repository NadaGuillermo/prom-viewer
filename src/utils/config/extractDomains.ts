import * as _ from "lodash-es";

export const extractDomainsFromConfig = (config: any): string[] => {
     const domains: string[] = [];
     
     config.questionnaires.forEach((questionnaire: any) => {
        const questionnaireDomains = questionnaire.domainItemMapping.map((dom: any) => dom.domain);
        domains.push(...questionnaireDomains);
     });
    return [...new Set(domains)];
}

export const extractGlobalHealthDomainsFromConfig = (config: any): string[] => {
    const globalDomains: string[] = [];
    
    config.questionnaires.forEach((questionnaire: any) => {
        const globalScores = questionnaire.globalScores;
        const domainsOfGlobalScores: string[] = [];
        globalScores.forEach((scoreId: any) => {
            const domain = questionnaire.domainItemMapping.find((mapping: any) => mapping.questions.map((q: any) => q.itemId).includes(scoreId)).domain;
            if (domain !== undefined) {
                domainsOfGlobalScores.push(domain);
            }
        });
        globalDomains.push(...domainsOfGlobalScores);
    });
    return _.uniq(globalDomains);
}