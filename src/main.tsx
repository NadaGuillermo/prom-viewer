import "./index.css";
import { loadColorConfig } from "@services/loadColorConfig";
import { applyThemeColorsToRoot } from "@utils/colors/applyColorConfig";
import { applyChartColorConfig } from "@utils/charts/chartColors";

// App.tsx (and, transitively, chartOptions.ts) is imported dynamically so its
// module evaluation - and the chart color values baked into it - happens only
// after the color config has been resolved and applied below.
async function bootstrap() {
  const colorConfig = await loadColorConfig();
  applyThemeColorsToRoot(colorConfig.theme);
  applyChartColorConfig(colorConfig);

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
