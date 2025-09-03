/**
 * Basic revert diagnostics for user-friendly messages.
 * Returns an object with `user` short text and `debug` full message.
 */
export function diagnose(err) {
  const raw = err?.message || String(err) || 'Swap failed';
  let user = 'فشل السواب';
  if (raw.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
    user = 'المخرجات أقل من الحد الأدنى. زد الانزلاق.';
  } else if (raw.includes('UNPREDICTABLE_GAS_LIMIT')) {
    user = 'لا يمكن تقدير الغاز. تحقق من السماح أو صحة الزوج.';
  } else if (raw.toLowerCase().includes('insufficient allowance')) {
    user = 'السماح غير كافٍ للتوكن.';
  } else if (raw.toLowerCase().includes('transfer amount exceeds balance')) {
    user = 'الرصيد غير كافٍ للتوكن.';
  }
  return { user, debug: raw };
}
