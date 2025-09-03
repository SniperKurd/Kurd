/**
 * Utilities to apply user-defined slippage.
 */
export const minOutput = (amountOut, slippage, force) => {
  if (force) return 0n;
  const slipBps = BigInt(Math.floor(slippage * 100));
  return amountOut - (amountOut * slipBps / 10000n);
};
