
export const globalDimension = "Overall Health/Quality of Life";
export const otherDimension = "Other";

export const SCORE_HEALTH_CORELATIONS = {increase: "increase", decrease: "decrease"};

export const DIMENSIONS = [globalDimension, "Physical Function", "Symptoms", "Emotional Well-being", "Social Function", otherDimension] as const;

export const ITEM_TYPES = {item: "item", score: "score"};