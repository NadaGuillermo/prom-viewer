import type * as Colors from "./types.d";

// Maps theme keys to the CSS custom properties declared in index.css.
// Explicit rather than derived so "base100" -> "--color-base-100" etc.
// doesn't rely on fragile string-casing rules.
const THEME_KEY_TO_CSS_VAR: Record<keyof Colors.ThemeColors, string> = {
  base100: "--color-base-100",
  base200: "--color-base-200",
  base300: "--color-base-300",
  baseContent: "--color-base-content",
  baseContentLight: "--color-base-content-light",
  primary: "--color-primary",
  primaryContent: "--color-primary-content",
  secondary: "--color-secondary",
  secondaryContent: "--color-secondary-content",
  accent: "--color-accent",
  accentContent: "--color-accent-content",
  neutral: "--color-neutral",
  neutralContent: "--color-neutral-content",
  info: "--color-info",
  infoContent: "--color-info-content",
  success: "--color-success",
  successContent: "--color-success-content",
  warning: "--color-warning",
  warningContent: "--color-warning-content",
  error: "--color-error",
  errorContent: "--color-error-content",
  borderLight: "--color-border-light",
  borderMedium: "--color-border-medium",
};

// Sets the theme colors as CSS custom properties on :root. Existing
// Tailwind classes (bg-primary, text-base-content, ...) keep working
// unchanged since they already read from these same variables.
export function applyThemeColorsToRoot(theme: Colors.ThemeColors): void {
  const root = document.documentElement;
  (Object.keys(THEME_KEY_TO_CSS_VAR) as Array<keyof Colors.ThemeColors>).forEach(
    (key) => {
      root.style.setProperty(THEME_KEY_TO_CSS_VAR[key], theme[key]);
    },
  );
}
