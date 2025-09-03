/**
 * Basic revert diagnostics for user-friendly messages.
 */
export function diagnose(err) {
  const msg = err?.message || 'Swap failed';
  if (msg.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
    return msg + '. Try increasing slippage.';
  }
  return msg;
}
