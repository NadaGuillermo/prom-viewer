export namespace Colors {
  export interface ThemeColors {
    base100: string;
    base200: string;
    base300: string;
    baseContent: string;
    baseContentLight: string;
    primary: string;
    primaryContent: string;
    secondary: string;
    secondaryContent: string;
    accent: string;
    accentContent: string;
    neutral: string;
    neutralContent: string;
    info: string;
    infoContent: string;
    success: string;
    successContent: string;
    warning: string;
    warningContent: string;
    error: string;
    errorContent: string;
    borderLight: string;
    borderMedium: string;
  }

  export interface CategoricalPalettes {
    muted: string[];
    okabeIto: string[];
  }

  export interface ReferenceBoxColors {
    color: string;
    opacities: number[];
  }

  export interface ReferenceColors {
    line: string;
    box: ReferenceBoxColors;
  }

  export interface ChartColorConfig {
    categoricalPalettes: CategoricalPalettes;
    reference: ReferenceColors;
  }

  export interface ColorConfig {
    theme: ThemeColors;
    charts: ChartColorConfig;
  }

  export type PartialThemeColors = Partial<ThemeColors>;

  export type PartialColorConfig = {
    theme?: PartialThemeColors;
    charts?: {
      categoricalPalettes?: Partial<CategoricalPalettes>;
      reference?: {
        line?: string;
        box?: Partial<ReferenceBoxColors>;
      };
    };
  };
}
