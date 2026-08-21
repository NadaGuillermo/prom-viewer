import { http, HttpResponse } from "msw";

import { buildNameMap } from "../buildNameMap";

const configFiles = buildNameMap(
  import.meta.glob<{ default: unknown }>("./data/*.json", { eager: true }),
);

export const configHandlers = [
  http.get(`${import.meta.env.BASE_URL}config/:name.json`, ({ params }) => {
    const name = Array.isArray(params.name) ? params.name[0] : params.name;
    const data = configFiles[name];
    if (data === undefined) {
      return HttpResponse.json({ error: `Config file "${name}" not found` }, { status: 404 });
    }
    return HttpResponse.json(data);
  }),
];
