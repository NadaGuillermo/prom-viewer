import type { GlobalTypes } from "@customTypes/globalTypes";
// import _ from "lodash";

export const calculateMean = (data: GlobalTypes.NumberOrNull[]) => {
  const filteredData = data.filter((value) => value !== null);
  if (filteredData.length === 0) {
    return null;
  }
  const sum = filteredData.reduce((a, b) => a + b, 0);
  const mean = sum / filteredData.length;
  return mean;
};

// ok
export const normalizeValue = (
  value: number,
  minValue: number,
  maxValue: number,
) => {
  if (minValue > maxValue) {
    // swap
    const temp = minValue;
    minValue = maxValue;
    maxValue = temp;
  }
  if (minValue === maxValue) {
    return value;
  }
  if (minValue < 0) {
    minValue = 0;
  }
  if (value < minValue) {
    return 0;
  }
  if (value > maxValue) {
    return 1;
  }

  return (value - minValue) / (maxValue - minValue);
};