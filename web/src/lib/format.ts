/** Formatting only. Totals and percentages come from fixtures or the lab adapter. */

export function formatInr(amount: number): string {
  const negative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const str = String(abs);
  const sign = negative ? "-" : "";
  if (str.length <= 3) return `${sign}₹${str}`;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${sign}₹${grouped},${last3}`;
}

export function formatInrCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 10_000_000) return `${amount < 0 ? "-" : ""}₹${trimNumber(abs / 10_000_000)} Cr`;
  if (abs >= 100_000) return `${amount < 0 ? "-" : ""}₹${trimNumber(abs / 100_000)} L`;
  return formatInr(amount);
}

function trimNumber(value: number) {
  const fixed = value.toFixed(1);
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
}

export function formatUnits(quantity: number) {
  return `${quantity.toLocaleString("en-IN")} units`;
}

export function formatShare(share: number) {
  return `${share.toFixed(1)} % of total`;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}

export function formatMonth(iso: string) {
  const [, month, day] = iso.split("-").map(Number);
  return `${day} ${months[month - 1]}`;
}
