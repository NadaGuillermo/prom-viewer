/**
 * @param value - the value to normalize
 * @param minValue - the lower bound of the value's range (swapped with `maxValue` if larger; clamped to 0 if negative)
 * @param maxValue - the upper bound of the value's range (swapped with `minValue` if smaller)
 * @returns `value` rescaled to the [0, 1] interval defined by `minValue` and `maxValue`, clamped to 0 or 1 if `value` falls outside that range, or the unchanged `value` if `minValue` equals `maxValue`
 */
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