/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import "./index.css";
import { loadColorConfig } from "@services/loadColorConfig";
import { loadDateFormatConfig } from "@services/loadDateFormatConfig";
import { applyThemeColorsToRoot } from "@utils/colors/applyColorConfig";
import { applyChartColorConfig } from "@utils/charts/chartColors";
import { applyDateFormatConfig } from "@utils/dateFormat/dateFormatStore";
import { enableMocking } from "@mocks/enableMocking";

// App.tsx (and, transitively, chartOptions.ts / the mapping pipeline) is
// imported dynamically so its module evaluation - and the color/date-format
// values baked into or read by it - happens only after both configs have
// been resolved and applied below. Mocking must be enabled before any of
// that, since the config loaders below are themselves fetch calls MSW needs
// to intercept.
async function bootstrap() {
  await enableMocking();

  const [colorConfig, dateFormatConfig] = await Promise.all([
    loadColorConfig(),
    loadDateFormatConfig(),
  ]);
  applyThemeColorsToRoot(colorConfig.theme);
  applyChartColorConfig(colorConfig);
  applyDateFormatConfig(dateFormatConfig);

  const [{ StrictMode }, { createRoot }, { default: App }] = await Promise.all([
    import("react"),
    import("react-dom/client"),
    import("./App.tsx"),
  ]);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
