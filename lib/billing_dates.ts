const BILLING_TIME_ZONE = "Africa/Nairobi";

export function formatBillingDateInput(value: string | Date): string {
  if (typeof value === "string" && !value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BILLING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const partValues = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${partValues.year}-${partValues.month}-${partValues.day}`;
}

export function formatBillingDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-KE", {
    timeZone: BILLING_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function addDaysToBillingDate(value: string, days: number): string {
  const [year, month, day] = value.split("-").map(Number);
  return formatBillingDateInput(
    new Date(Date.UTC(year, month - 1, day + days)),
  );
}
