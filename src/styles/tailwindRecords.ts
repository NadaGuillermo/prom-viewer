import type { Style } from "@styles/types";

export const backgroundColorRecord: Record<Style.Color, string> = {
  base: "tw:bg-base-100",
  // "base-200": "tw:bg-base-200",
  // "base-300": "tw:bg-base-300",

  // "base-content": "tw:bg-base-content",
  // "base-content-light": "tw:bg-base-content-light",

  primary: "tw:bg-primary",
  // "primary-content": "tw:bg-primary-content",

  secondary: "tw:bg-secondary",
  // "secondary-content": "tw:bg-secondary-content",

  accent: "tw:bg-accent",
  // "accent-content": "tw:bg-accent-content",

  neutral: "tw:bg-neutral",
  // "neutral-content": "tw:bg-neutral-content",

  info: "tw:bg-info",
  // "info-content": "tw:bg-info-content",

  success: "tw:bg-success",
  // "success-content": "tw:bg-success-content",
  
  warning: "tw:bg-warning",
  // "warning-content": "tw:bg-warning-content",

  error: "tw:bg-error",
  // "error-content": "tw:bg-error-content",
}

export const textColorRecord: Record<Style.Color, string> = {
  // "base-100": "tw:text-base-100",
  // "base-200": "tw:text-base-200",
  // "base-300": "tw:text-base-300",

  base: "tw:text-base-content",
  // "base-content-light": "tw:text-base-content-light",

  // primary: "tw:text-primary",
  primary: "tw:text-primary-content",

  // secondary: "tw:text-secondary",
  secondary: "tw:text-secondary-content",

  // accent: "tw:text-accent",
  accent: "tw:text-accent-content",

  // neutral: "tw:text-neutral",
  neutral: "tw:text-neutral-content",

  // info: "tw:text-info",
  info: "tw:text-info-content",

  // success: "tw:text-success",
  success: "tw:text-success-content",
  
  // warning: "tw:text-warning",
  warning: "tw:text-warning-content",

  // error: "tw:text-error",
  error: "tw:text-error-content",
}

export const borderColorRecord: Record<Style.Color, string> = {
  // "base-100": "tw:border-base-100",
  // "base-200": "tw:border-base-200",
  // "base-300": "tw:border-base-300",

  base: "tw:border-base-content",
  // "base-content-light": "tw:border-base-content-light",

  // primary: "tw:border-primary",
  primary: "tw:border-primary",

  // secondary: "tw:border-secondary",
  secondary: "tw:border-secondary",

  // accent: "tw:border-accent",
  accent: "tw:border-accent",

  neutral: "tw:border-neutral",
  // neutral: "tw:border-neutral-content",

  info: "tw:border-info",
  // info: "tw:border-info-content",

  success: "tw:border-success",
  // success: "tw:border-success-content",
  
  warning: "tw:border-warning",
  // warning: "tw:border-warning-content",

  error: "tw:border-error",
  // error: "tw:border-error-content",
}