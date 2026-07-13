// Utility for handling Arabic text in PDFs
import ArabicReshaper from "arabic-reshaper";

export function reshapeArabicText(text: string): string {
  try {
    return ArabicReshaper.convertArabic(text);
  } catch {
    // Fallback if reshape fails
    return text;
  }
}

// Convert number to words in French (for invoice amounts)
const ones: Record<number, string> = {
  0: "zéro",
  1: "un",
  2: "deux",
  3: "trois",
  4: "quatre",
  5: "cinq",
  6: "six",
  7: "sept",
  8: "huit",
  9: "neuf",
  10: "dix",
  11: "onze",
  12: "douze",
  13: "treize",
  14: "quatorze",
  15: "quinze",
  16: "seize",
  17: "dix-sept",
  18: "dix-huit",
  19: "dix-neuf",
};

const tens: Record<number, string> = {
  2: "vingt",
  3: "trente",
  4: "quarante",
  5: "cinquante",
  6: "soixante",
  7: "soixante-dix",
  8: "quatre-vingt",
  9: "quatre-vingt-dix",
};

const scales: Array<{ value: number; name: string }> = [
  { value: 1000000000000, name: "billions" },
  { value: 1000000000, name: "milliards" },
  { value: 1000000, name: "millions" },
  { value: 1000, name: "mille" },
  { value: 100, name: "cents" },
];

function convertUnderThousand(num: number): string {
  if (num === 0) return "";
  if (num < 20) return ones[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (one === 0) return tens[ten];
    if (ten === 8) return tens[ten] + "-" + ones[one];
    return tens[ten] + "-" + ones[one];
  }
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  let result = ones[hundred] + " cents";
  if (remainder === 0) return result;
  if (remainder < 20) return result + " " + ones[remainder];
  const ten = Math.floor(remainder / 10);
  const one = remainder % 10;
  if (one === 0) return result + " " + tens[ten];
  return result + " " + tens[ten] + " " + ones[one];
}

export function numberToWordsInFrench(num: number): string {
  if (num === 0) return "zéro";
  if (num < 0) return "moins " + numberToWordsInFrench(-num);

  let result = "";
  for (const scale of scales) {
    if (num >= scale.value) {
      const count = Math.floor(num / scale.value);
      const scaleWords = convertUnderThousand(count);
      result += scaleWords + " " + scale.name + " ";
      num %= scale.value;
    }
  }

  if (num > 0) {
    result += convertUnderThousand(num);
  }

  return result.trim();
}

export function formatAmountInWords(amount: number, currency = "dinars"): string {
  const wholePart = Math.floor(amount);
  const centPart = Math.round((amount - wholePart) * 100);

  let text = numberToWordsInFrench(wholePart) + ` ${currency}`;
  if (centPart > 0) {
    text += " et " + numberToWordsInFrench(centPart) + " centimes";
  }

  return text;
}

// Format currency with DZD using dynamic locale
export function formatDZD(amount: number, locale = "fr-DZ"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format simple number using dynamic locale
export function formatNumberDZ(amount: number, locale = "fr-DZ"): string {
  return amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
