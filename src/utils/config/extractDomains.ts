import * as _ from "lodash-es";
import type { Config } from "./types";

export const extractDomainsFromConfig = (config: Config.PromConfig): Record<string, number> => {
     // const domains: string[] = [];
     const domainCount: Record<string, number> = {};
     
     config.questionnaires.forEach((questionnaire) => {
        const questionnaireDomains: string[] = questionnaire.domainItemMapping.map((dom) => dom.domain).filter((domain) => domain !== undefined);
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

export const extractGlobalHealthDomainsFromConfig = (config: Config.PromConfig): string[] => {
    const globalDomains: string[] = [];
    
    config.questionnaires.forEach((questionnaire) => {
        const globalScores = questionnaire.globalScores;
        const domainsOfGlobalScores: string[] = [];
        if (globalScores !== undefined) {
            globalScores.forEach((scoreId) => {
            const domain = questionnaire.domainItemMapping.find((mapping) => mapping.questions?.map((q) => q.itemId).includes(scoreId))?.domain;
            if (domain !== undefined) {
                domainsOfGlobalScores.push(domain);
            }
        });
        }       
        globalDomains.push(...domainsOfGlobalScores);
    });
    return _.uniq(globalDomains);
}