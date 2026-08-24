import { http, HttpResponse } from "msw";

import { buildNameMap } from "../buildNameMap";

const bundles = buildNameMap(
  import.meta.glob<{ default: unknown }>("./data/bundles/*.json", { eager: true }),
);
const questionnaires = buildNameMap(
  import.meta.glob<{ default: unknown }>("./data/questionnaires/*.json", { eager: true }),
);
const questionnaireResponses = buildNameMap(
  import.meta.glob<{ default: unknown }>("./data/questionnaireResponses/*.json", { eager: true }),
);
const observationDefinitions = buildNameMap(
  import.meta.glob<{ default: unknown }>("./data/observationDefinitions/*.json", { eager: true }),
);
const observations = buildNameMap(
  import.meta.glob<{ default: unknown }>("./data/observations/*.json", { eager: true }),
);
const patients = buildNameMap(
  import.meta.glob<{ default: unknown }>("./data/patients/*.json", { eager: true }),
);

/**
 * @param folder - fixture folder name, matching the path segment MockFhirDataSource requests (e.g. "bundles")
 * @param fixtures - name -> JSON map for that folder, built by buildNameMap
 * @returns an MSW request handler serving GET {BASE_URL}{folder}/:name.json from the fixture map
 * @description Returns 404 with a JSON error body for unknown fixture names, mirroring real API error behavior.
 */
function fixtureHandler(folder: string, fixtures: Record<string, unknown>) {
  return http.get(`${import.meta.env.BASE_URL}${folder}/:name.json`, ({ params }) => {
    const name = Array.isArray(params.name) ? params.name[0] : params.name;
    const data = fixtures[name];
    if (data === undefined) {
      return HttpResponse.json({ error: `Fixture "${name}" not found in ${folder}` }, { status: 404 });
    }
    return HttpResponse.json(data);
  });
}

export const fhirHandlers = [
  fixtureHandler("bundles", bundles),
  fixtureHandler("questionnaires", questionnaires),
  fixtureHandler("questionnaireResponses", questionnaireResponses),
  fixtureHandler("observationDefinitions", observationDefinitions),
  fixtureHandler("observations", observations),
  fixtureHandler("patients", patients),
];
