export function normalizeNumber(value: string) {
  return value.toUpperCase().replace(/[\s-]/g, '');
}
const isoValues = '0123456789A?BCDEFGHIJK?LMNOPQRSTU?VWXYZ';
export function checkDigit(firstTen: string): number | null {
  if (!/^[A-Z]{3}[UJZ]\d{6}$/.test(firstTen)) return null;
  const sum = [...firstTen].reduce((total, ch, i) => total + isoValues.indexOf(ch) * 2 ** i, 0);
  return (sum % 11) % 10;
}
export function identityStatus(number: string) {
  const n = normalizeNumber(number);
  if (!/^[A-Z]{3}[UJZ]\d{7}$/.test(n))
    return {
      valid: false,
      message: 'Use 4 letters and 7 digits, or request an administrator exception.',
    };
  const valid = checkDigit(n.slice(0, 10)) === Number(n[10]);
  return {
    valid,
    message: valid
      ? 'ISO 6346 check digit verified'
      : 'Check digit differs. Correct the number or request an administrator exception.',
  };
}
export function extractCandidates(text: string): string[] {
  const compact = text.toUpperCase().replace(/[\s.\-]/g, '');
  const matches = compact.match(/[A-Z]{3}[UJZ][0-9OIL]{7}/g) ?? [];
  return [
    ...new Set(
      matches.map((n) => n.slice(0, 4) + n.slice(4).replace(/O/g, '0').replace(/[IL]/g, '1')),
    ),
  ];
}
