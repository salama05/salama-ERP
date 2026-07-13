import { z } from "zod";

// Validator for fields containing only digits
const digitOnlyString = (fieldName: string, length?: number) => {
  let validator = z
    .string()
    .min(1, { message: `${fieldName} is required` })
    .regex(/^\d+$/, { message: `${fieldName} must contain only digits` });

  if (length !== undefined) {
    validator = validator.length(length, {
      message: `${fieldName} must be exactly ${length} digits`,
    });
  }

  return validator;
};

// Multilingual text fields schema (supporting ar, fr, en)
export const localizedTextSchema = z.object({
  ar: z.string().min(1, { message: "Required in Arabic" }),
  fr: z.string().min(1, { message: "Required in French" }),
  en: z.string().min(1, { message: "Required in English" }),
});

export const merchantSettingsSchema = z.object({
  store_name: z.string().min(1, { message: "Store name is required" }),
  logo: z.string().optional(),
  phone: z.string().min(1, { message: "Phone number is required" }),
  email: z.string().email({ message: "Invalid email address" }).or(z.literal("")),
  nif: digitOnlyString("Tax ID (NIF)", 15),
  rc: z.string().min(1, { message: "Commercial Registry (RC) is required" }),
  nis: digitOnlyString("Statistical ID (NIS)", 15),
  n_art: z
    .string()
    .min(1, { message: "Article Number (n_art) is required" })
    .regex(/^\d+$/, { message: "Article Number must contain only digits" }),
  company_type: z.enum(["SARL", "EURL", "SPA", "SNC", "Personne Physique"], {
    errorMap: () => ({ message: "Please select a valid company type" }),
  }),
  business_activity: localizedTextSchema,
  company_address: localizedTextSchema,
  defaultCurrency: z.string().min(1, { message: "Default Currency is required" }).default("DZD"),
  isMultiCurrencyEnabled: z.boolean().default(false),
  defaultTvaRate: z.number().min(0).max(100).default(19),
  invoicePrefix: z.string().min(1, { message: "Invoice Prefix is required" }).default("FACT-"),
});

export type MerchantSettingsFormValues = z.infer<typeof merchantSettingsSchema>;
