/**
 * Utilities to apply user-defined slippage and price impact.
 */
export const minOutput = (amountOut, slippage, force) => {
  if (force) return 0n;
  const slipBps = BigInt(Math.floor(slippage * 100));
  return amountOut - (amountOut * slipBps / 10000n);
};

export const priceImpact = (amountInNum, amountOutNum, spotPrice) => {
  const execution = amountOutNum / amountInNum;
  return ((execution / spotPrice) - 1) * 100;
};
