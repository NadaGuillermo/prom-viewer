/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import * as _ from "lodash-es";

import type * as Config from "./types";

export const extractDomainsFromConfig = (
  config: Config.PromConfig,
): Record<string, number> => {
  const domainCount: Record<string, number> = {};

  config.questionnaires.forEach((questionnaire) => {
    const questionnaireDomains: string[] = questionnaire.domainItemMapping
      .map((dom) => dom.domain)
      .filter((domain) => domain !== undefined);
    questionnaireDomains.forEach((dom: string) => {
      if (domainCount[dom] === undefined) {
        domainCount[dom] = 1;
      } else {
        domainCount[dom] += 1;
      }
    });
  });
  return domainCount;
};

export const extractGlobalHealthDomainsFromConfig = (
  config: Config.PromConfig,
): string[] => {
  const globalDomains: string[] = [];

  config.questionnaires.forEach((questionnaire) => {
    const globalScores = questionnaire.globalScores;
    const domainsOfGlobalScores: string[] = [];
    if (globalScores !== undefined) {
      globalScores.forEach((scoreId) => {
        const domain = questionnaire.domainItemMapping.find((mapping) =>
          mapping.questions?.map((q) => q.itemId).includes(scoreId),
        )?.domain;
        if (domain !== undefined) {
          domainsOfGlobalScores.push(domain);
        }
      });
    }
    globalDomains.push(...domainsOfGlobalScores);
  });
  return _.uniq(globalDomains);
};
