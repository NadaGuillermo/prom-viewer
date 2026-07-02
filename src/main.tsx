import "./index.css";
import { loadColorConfig } from "@services/loadColorConfig";
import { loadDateFormatConfig } from "@services/loadDateFormatConfig";
import { applyThemeColorsToRoot } from "@utils/colors/applyColorConfig";
import { applyChartColorConfig } from "@utils/charts/chartColors";
import { applyDateFormatConfig } from "@utils/dateFormat/dateFormatStore";

// App.tsx (and, transitively, chartOptions.ts / the mapping pipeline) is
// imported dynamically so its module evaluation - and the color/date-format
// values baked into or read by it - happens only after both configs have
// been resolved and applied below.
async function bootstrap() {
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
