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