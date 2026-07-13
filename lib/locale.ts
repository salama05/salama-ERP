import type { Language } from "@/lib/i18n";

export function getLocale(language: Language): string {
  if (language === "ar") return "ar-DZ";
  if (language === "en") return "en-US";
  return "fr-FR";
}

export function formatDate(
  date: Date | string | number,
  language: Language,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(getLocale(language), options).format(new Date(date));
}