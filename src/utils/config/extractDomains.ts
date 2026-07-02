import * as _ from "lodash-es";

export const extractDomainsFromConfig = (config: any): Record<string, number> => {
     // const domains: string[] = [];
     const domainCount: Record<string, number> = {};
     
     config.questionnaires.forEach((questionnaire: any) => {
        const questionnaireDomains: string[] = questionnaire.domainItemMapping.map((dom: any) => dom.domain);
        questionnaireDomains.forEach((dom: string) => {
            if (domainCount[dom] === undefined) {
                domainCount[dom] = 1;
            }
            else {
                domainCount[dom] += 1;
            }
        })
        // domains.push(...questionnaireDomains);
     });
    // return [...new Set(domains)];
    return domainCount;
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