export function calcFeeCents(subtotalCents: number, pct = Number(process.env.OQFOZ_FEE_PCT || 10)) {
  return Math.round((subtotalCents * pct) / 100);
}

