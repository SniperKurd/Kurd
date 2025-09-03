/**
 * Formatting helpers for numbers.
 */
export const formatPrice = (value, decimals = 6) => {
  return Number(value).toFixed(decimals);
};
