/** Normalize a phone string to digits only. */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Build a tel: href from a display phone number. */
export function phoneTelHref(phone: string): string {
  const digits = phoneDigits(phone);
  if (!digits) return "tel:";
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  return `tel:${digits}`;
}

/** Strip a tel: prefix for editing display values. */
export function phoneFromTelHref(href: string): string {
  return href.replace(/^tel:/i, "").replace(/^\+1/, "").trim();
}
