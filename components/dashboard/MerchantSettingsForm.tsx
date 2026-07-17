"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Upload, X, DollarSign, Receipt, Percent } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  merchantSettingsSchema,
  MerchantSettingsFormValues,
} from "@/lib/validations/merchantSettings";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthSafe } from "@/hooks/useAuthSafe";

const CURRENCIES = [
  { code: "DZD", label: "Dinar Algérien (DZD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "USD", label: "US Dollar (USD)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "MAD", label: "Dirham Marocain (MAD)" },
  { code: "TND", label: "Dinar Tunisien (TND)" },
];

const TVA_RATES = [0, 9, 19];

const defaultDictionaries = {
  ar: {
    storeNameLabel: "اسم المتجر / الشركة",
    logoLabel: "شعار الشركة",
    phoneLabel: "رقم الهاتف",
    emailLabel: "البريد الإلكتروني",
    nifLabel: "الرقم الجبائي (NIF)",
    rcLabel: "سجل تجاري (RC)",
    nisLabel: "رقم التعريف الإحصائي (NIS)",
    nArtLabel: "رقم المادة (N° Art)",
    companyTypeLabel: "نوع المؤسسة",
    businessActivityLabel: "النشاط التجاري",
    companyAddressLabel: "عنوان الشركة",
    saveButton: "حفظ التغييرات",
    savingText: "جاري الحفظ...",
    arTab: "العربية (RTL)",
    frTab: "الفرنسية (LTR)",
    enTab: "الإنجليزية (LTR)",
    validationMessage: "يرجى تعبئة الحقول المطلوبة باللغة المحددة.",
    uploadLogo: "تحميل الشعار",
    removeLogo: "إزالة الشعار",
    companyTypes: {
      SARL: "ذ.م.م (SARL)",
      EURL: "ش.ذ.م.م (EURL)",
      SPA: "ش.م.أ (SPA)",
      SNC: "شركة تضامن (SNC)",
      "Personne Physique": "شخص طبيعي (Personne Physique)",
    },
    // New fields
    invoicingSettingsTitle: "إعدادات الفاتورة والعملة",
    defaultCurrencyLabel: "العملة الافتراضية",
    multiCurrencyLabel: "تفعيل متعدد العملات",
    multiCurrencyDesc: "السماح بتجاوز العملة لكل فاتورة أو منتج",
    defaultTvaLabel: "نسبة TVA الافتراضية (%)",
    defaultTvaDesc: "سيتم استخدام هذه النسبة افتراضياً، مع إمكانية تخصيص لكل منتج",
    invoicePrefixLabel: "بادئة رقم الفاتورة",
    invoicePrefixDesc: "مثال: FACT- → يُنتج FACT-2026-001 (متسلسل وبدون انقطاع)",
  },
  fr: {
    storeNameLabel: "Nom de l'entreprise",
    logoLabel: "Logo de l'entreprise",
    phoneLabel: "N° de téléphone",
    emailLabel: "Adresse e-mail",
    nifLabel: "Identifiant Fiscal (NIF)",
    rcLabel: "Registre du Commerce (RC)",
    nisLabel: "Numéro d'Identification Statistique (NIS)",
    nArtLabel: "Numéro d'Article (N° Art)",
    companyTypeLabel: "Type d'entreprise",
    businessActivityLabel: "Activité commerciale",
    companyAddressLabel: "Adresse de l'entreprise",
    saveButton: "Enregistrer les modifications",
    savingText: "Enregistrement...",
    arTab: "Arabe (RTL)",
    frTab: "Français (LTR)",
    enTab: "Anglais (LTR)",
    validationMessage: "Veuillez remplir les informations requises dans chaque langue.",
    uploadLogo: "Télécharger le logo",
    removeLogo: "Supprimer le logo",
    companyTypes: {
      SARL: "SARL",
      EURL: "EURL",
      SPA: "SPA",
      SNC: "SNC",
      "Personne Physique": "Personne Physique",
    },
    // New fields
    invoicingSettingsTitle: "Paramètres de facturation & devise",
    defaultCurrencyLabel: "Devise par défaut",
    multiCurrencyLabel: "Activer la multi-devise",
    multiCurrencyDesc: "Permet de surcharger la devise par facture ou produit",
    defaultTvaLabel: "Taux TVA par défaut (%)",
    defaultTvaDesc: "Ce taux sera appliqué par défaut ; chaque produit peut être personnalisé",
    invoicePrefixLabel: "Préfixe de numérotation",
    invoicePrefixDesc: "Ex: FACT- → génère FACT-2026-001 (séquentiel, sans saut)",
  },
  en: {
    storeNameLabel: "Business Name",
    logoLabel: "Company Logo",
    phoneLabel: "Phone Number",
    emailLabel: "Email Address",
    nifLabel: "Tax ID (NIF)",
    rcLabel: "Commercial Registry (RC)",
    nisLabel: "Statistical ID (NIS)",
    nArtLabel: "Article Number (N° Art)",
    companyTypeLabel: "Company Type",
    businessActivityLabel: "Business Activity",
    companyAddressLabel: "Company Address",
    saveButton: "Save Changes",
    savingText: "Saving...",
    arTab: "Arabic (RTL)",
    frTab: "French (LTR)",
    enTab: "English (LTR)",
    validationMessage: "Please fill in the required fields in each language.",
    uploadLogo: "Upload Logo",
    removeLogo: "Remove Logo",
    companyTypes: {
      SARL: "SARL",
      EURL: "EURL",
      SPA: "SPA",
      SNC: "SNC",
      "Personne Physique": "Individual (Personne Physique)",
    },
    // New fields
    invoicingSettingsTitle: "Invoicing & Currency Settings",
    defaultCurrencyLabel: "Default Currency",
    multiCurrencyLabel: "Enable Multi-Currency",
    multiCurrencyDesc: "Allow currency override per invoice or product",
    defaultTvaLabel: "Default VAT/TVA Rate (%)",
    defaultTvaDesc: "Applied by default; individual products can override this",
    invoicePrefixLabel: "Invoice Number Prefix",
    invoicePrefixDesc: "e.g. FACT- → produces FACT-2026-001 (sequential, gap-free)",
  },
};

export interface MerchantSettingsFormProps {
  translations?: Partial<typeof defaultDictionaries.fr>;
  onSaveSuccess?: (payload: MerchantSettingsFormValues) => void;
}

export function MerchantSettingsForm({
  translations: customTranslations,
  onSaveSuccess,
}: MerchantSettingsFormProps) {
  const { language, dir } = useI18n();
  const isRTL = dir === "rtl";
  const { orgId } = useAuthSafe();

  const dict = {
    ...defaultDictionaries[language],
    ...customTranslations,
  };

  const [activeTab, setActiveTab] = useState<"ar" | "fr" | "en">(language);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Fetch settings from Convex
  const serverSettings = useQuery(
    api.settings.getOrganizationSettings,
    orgId ? { orgId } : "skip"
  );

  // Convex mutation
  const updateSettings = useMutation(api.settings.updateOrganizationSettings);

  const fallbackValues: MerchantSettingsFormValues = {
    store_name: "",
    logo: "",
    phone: "",
    email: "",
    nif: "123456789012345",
    rc: "",
    nis: "987654321098765",
    n_art: "",
    company_type: "SARL",
    business_activity: { ar: "", fr: "", en: "" },
    company_address: { ar: "", fr: "", en: "" },
    defaultCurrency: "DZD",
    isMultiCurrencyEnabled: false,
    defaultTvaRate: 19,
    invoicePrefix: "FACT-",
  };

  const form = useForm<MerchantSettingsFormValues>({
    resolver: zodResolver(merchantSettingsSchema),
    defaultValues: fallbackValues,
  });

  // Populate form from server once data is available
  useEffect(() => {
  if (serverSettings) {
    form.reset({
      store_name: serverSettings.store_name,
      logo: serverSettings.logo ?? "",
      phone: serverSettings.phone,
      email: serverSettings.email,
      nif: serverSettings.nif,
      rc: serverSettings.rc,
      nis: serverSettings.nis,
      n_art: serverSettings.n_art,
      company_type: serverSettings.company_type as MerchantSettingsFormValues["company_type"],
      business_activity: serverSettings.business_activity,
      company_address: serverSettings.company_address,
      defaultCurrency: serverSettings.defaultCurrency,
      isMultiCurrencyEnabled: serverSettings.isMultiCurrencyEnabled,
      defaultTvaRate: serverSettings.defaultTvaRate,
      invoicePrefix: serverSettings.invoicePrefix,
    });
  }
}, [serverSettings, form]);


  const logoValue = form.watch("logo");
  const isMultiCurrencyEnabled = form.watch("isMultiCurrencyEnabled");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("logo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    form.setValue("logo", "");
  };

  const onSubmit = async (values: MerchantSettingsFormValues) => {
    if (!orgId) return;
    setIsSubmitting(true);
    setSaveStatus("idle");

    try {
      await updateSettings({
        orgId,
        ...values,
        logo: values.logo || undefined,
        email: values.email ?? "",
      });
      setSaveStatus("success");
      // Keep localStorage in sync for legacy components that still read it
      if (typeof window !== "undefined") {
        window.localStorage.setItem("merchant_settings", JSON.stringify(values));
        window.dispatchEvent(new Event("merchant_settings_changed"));
      }
      if (onSaveSuccess) onSaveSuccess(values);
    } catch (error) {
      console.error("Failed to update merchant settings", error);
      setSaveStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        dir={dir}
      >
        {/* Profile / General Panel */}
        <section className="surface-panel p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-sm space-y-6">
          <h3 className={cn("text-lg font-semibold border-b pb-2 text-[var(--color-text-primary)] border-[var(--color-border)]", isRTL ? "text-right" : "text-left")}>
            {language === "ar" ? "الملف الشخصي والبيانات العامة" : language === "fr" ? "Profil & Informations Générales" : "Profile & General Info"}
          </h3>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo Uploader */}
            <div className={cn("flex flex-col items-center gap-2 w-full md:w-auto", isRTL ? "md:order-last" : "")}>
              <FormLabel className="text-sm font-medium self-start md:self-center">{dict.logoLabel}</FormLabel>
              <div className="relative group w-32 h-32 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] hover:bg-[var(--color-bg-hover)] transition-all flex items-center justify-center overflow-hidden">
                {logoValue ? (
                  <>
                    <img src={logoValue} alt="Store logo" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">{dict.uploadLogo}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* General Fields */}
            <div className="flex-1 grid gap-5 md:grid-cols-2 w-full">
              {/* Store Name */}
              <FormField
                control={form.control}
                name="store_name"
                render={({ field }) => (
                  <FormItem className={cn("flex flex-col", isRTL ? "items-start text-right" : "items-start text-left")}>
                    <FormLabel className="text-sm font-medium mb-1">{dict.storeNameLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Salama Food"
                        className="form-input"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className={cn("flex flex-col", isRTL ? "items-start text-right" : "items-start text-left")}>
                    <FormLabel className="text-sm font-medium mb-1">{dict.phoneLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+213 XX XX XX XX"
                        className="form-input"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className={cn("flex flex-col", isRTL ? "items-start text-right" : "items-start text-left")}>
                    <FormLabel className="text-sm font-medium mb-1">{dict.emailLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="contact@company.com"
                        className="form-input"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>

        {/* Legal Identifiers Panel */}
        <section className="surface-panel p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-sm space-y-6">
          <h3 className={cn("text-lg font-semibold border-b pb-2 text-[var(--color-text-primary)] border-[var(--color-border)]", isRTL ? "text-right" : "text-left")}>
            {language === "ar" ? "المعلومات القانونية والهوية" : language === "fr" ? "Informations Légales & Identifiants" : "Legal Information & IDs"}
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* NIF */}
            <FormField
              control={form.control}
              name="nif"
              render={({ field }) => (
                <FormItem className={cn("flex flex-col", isRTL ? "items-start text-right" : "items-start text-left")}>
                  <FormLabel className="text-sm font-medium mb-1">{dict.nifLabel}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. 123456789012345"
                      className="form-input text-left"
                      dir="ltr"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* RC */}
            <FormField
              control={form.control}
              name="rc"
              render={({ field }) => (
                <FormItem className={cn("flex flex-col", isRTL ? "items-start text-right" : "items-start text-left")}>
                  <FormLabel className="text-sm font-medium mb-1">{dict.rcLabel}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. 16/00-1234567B26"
                      className="form-input text-left"
                      dir="ltr"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* NIS */}
            <FormField
              control={form.control}
              name="nis"
              render={({ field }) => (
                <FormItem className={cn("flex flex-col", isRTL ? "items-start text-right" : "items-start text-left")}>
                  <FormLabel className="text-sm font-medium mb-1">{dict.nisLabel}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. 987654321098765"
                      className="form-input text-left"
                      dir="ltr"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* N Art */}
            <FormField
              control={form.control}
              name="n_art"
              render={({ field }) => (
                <FormItem className={cn("flex flex-col", isRTL ? "items-start text-right" : "items-start text-left")}>
                  <FormLabel className="text-sm font-medium mb-1">{dict.nArtLabel}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. 16201234567"
                      className="form-input text-left"
                      dir="ltr"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Company Type */}
            <FormField
              control={form.control}
              name="company_type"
              render={({ field }) => (
                <FormItem className={cn("flex flex-col", isRTL ? "items-start text-right" : "items-start text-left")}>
                  <FormLabel className="text-sm font-medium mb-1">{dict.companyTypeLabel}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="form-input h-10 w-full" dir={dir}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-md">
                      {(["SARL", "EURL", "SPA", "SNC", "Personne Physique"] as const).map(
                        (type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="focus:bg-[var(--color-bg-hover)] cursor-pointer"
                            dir={dir}
                          >
                            {dict.companyTypes[type]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Localized Details Section */}
        <section className="surface-panel p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-sm space-y-6">
          <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3 border-[var(--color-border)]", isRTL && "sm:flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {language === "ar" ? "النشاط التجاري والعنوان متعدد اللغات" : language === "fr" ? "Activité & Adresse Multilingues" : "Bilingual Business Activity & Address"}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {dict.validationMessage}
              </p>
            </div>

            {/* Translation Tabs */}
            <div className="flex bg-[var(--color-bg-base)] p-1 rounded-lg border border-[var(--color-border)] w-fit" dir="ltr">
              {(["ar", "fr", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTab(lang)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                    activeTab === lang
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {lang === "ar" ? dict.arTab : lang === "fr" ? dict.frTab : dict.enTab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Panels */}
          <div className="space-y-6 mt-4">
            {/* Arabic Tab Input Fields */}
            <div className={cn("space-y-6", activeTab !== "ar" && "hidden")} dir="rtl">
              <FormField
                control={form.control}
                name="business_activity.ar"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start text-right">
                    <FormLabel className="text-sm font-medium mb-1">{dict.businessActivityLabel} (العربية)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="مثال: استيراد وتوزيع المواد الغذائية"
                        className="form-input text-right"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_address.ar"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start text-right">
                    <FormLabel className="text-sm font-medium mb-1">{dict.companyAddressLabel} (العربية)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="مثال: 12 شارع ديدوش مراد، الجزائر العاصمة"
                        className="form-input text-right"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />
            </div>

            {/* French Tab Input Fields */}
            <div className={cn("space-y-6", activeTab !== "fr" && "hidden")} dir="ltr">
              <FormField
                control={form.control}
                name="business_activity.fr"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start text-left">
                    <FormLabel className="text-sm font-medium mb-1">{dict.businessActivityLabel} (Français)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Importation et distribution de produits alimentaires"
                        className="form-input text-left"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_address.fr"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start text-left">
                    <FormLabel className="text-sm font-medium mb-1">{dict.companyAddressLabel} (Français)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: 12 Rue Didouche Mourad, Alger"
                        className="form-input text-left"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />
            </div>

            {/* English Tab Input Fields */}
            <div className={cn("space-y-6", activeTab !== "en" && "hidden")} dir="ltr">
              <FormField
                control={form.control}
                name="business_activity.en"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start text-left">
                    <FormLabel className="text-sm font-medium mb-1">{dict.businessActivityLabel} (English)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Import and distribution of food products"
                        className="form-input text-left"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_address.en"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start text-left">
                    <FormLabel className="text-sm font-medium mb-1">{dict.companyAddressLabel} (English)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: 12 Didouche Mourad Street, Algiers"
                        className="form-input text-left"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>

        {/* ── Invoicing & Currency Settings ─────────────────────────── */}
        <section className="surface-panel p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-sm space-y-6">
          <h3 className={cn("text-lg font-semibold border-b pb-2 text-[var(--color-text-primary)] border-[var(--color-border)] flex items-center gap-2", isRTL ? "text-right flex-row-reverse" : "text-left")}>
            <Receipt className="w-5 h-5 text-[var(--color-brand-light)]" />
            {dict.invoicingSettingsTitle}
          </h3>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Default Currency */}
            <FormField
              control={form.control}
              name="defaultCurrency"
              render={({ field }) => (
                <FormItem className={cn("flex flex-col", isRTL ? "items-start text-right" : "items-start text-left")}>
                  <FormLabel className="text-sm font-medium mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                    {dict.defaultCurrencyLabel}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="form-input h-10 w-full" dir={dir}>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-md">
                      {CURRENCIES.map((c) => (
                        <SelectItem
                          key={c.code}
                          value={c.code}
                          className="focus:bg-[var(--color-bg-hover)] cursor-pointer"
                        >
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Multi-Currency Toggle */}
            <FormField
              control={form.control}
              name="isMultiCurrencyEnabled"
              render={({ field }) => (
                <FormItem className={cn("flex flex-col justify-between rounded-lg border border-[var(--color-border)] p-4 bg-[var(--color-bg-base)]", isRTL ? "items-end text-right" : "items-start text-left")}>
                  <div className={cn("flex items-center justify-between w-full", isRTL && "flex-row-reverse")}>
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <FormLabel className="text-sm font-medium">{dict.multiCurrencyLabel}</FormLabel>
                      <FormDescription className="text-xs text-[var(--color-text-secondary)] mt-0.5 max-w-xs">
                        {dict.multiCurrencyDesc}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="isMultiCurrencyEnabled"
                        aria-label={dict.multiCurrencyLabel}
                      />
                    </FormControl>
                  </div>
                  {isMultiCurrencyEnabled && (
                    <p className="text-xs mt-2 text-amber-500 font-medium">
                      {language === "ar"
                        ? "⚠ متعدد العملات مُفعّل — يمكن تخصيص العملة لكل فاتورة"
                        : language === "fr"
                        ? "⚠ Multi-devise activé — peut être surchargé par facture"
                        : "⚠ Multi-currency active — can be overridden per invoice"}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Default TVA Rate */}
            <FormField
              control={form.control}
              name="defaultTvaRate"
              render={({ field }) => (
                <FormItem className={cn("flex flex-col", isRTL ? "items-start text-right" : "items-start text-left")}>
                  <FormLabel className="text-sm font-medium mb-1 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                    {dict.defaultTvaLabel}
                  </FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger className="form-input h-10 w-full" dir={dir}>
                        <SelectValue placeholder="Select TVA rate" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-md">
                      {TVA_RATES.map((rate) => (
                        <SelectItem
                          key={rate}
                          value={String(rate)}
                          className="focus:bg-[var(--color-bg-hover)] cursor-pointer"
                        >
                          {rate}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {dict.defaultTvaDesc}
                  </FormDescription>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Invoice Number Prefix */}
            <FormField
              control={form.control}
              name="invoicePrefix"
              render={({ field }) => (
                <FormItem className={cn("flex flex-col", isRTL ? "items-start text-right" : "items-start text-left")}>
                  <FormLabel className="text-sm font-medium mb-1">
                    {dict.invoicePrefixLabel}
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        placeholder="FACT-"
                        className="form-input text-left font-mono"
                        dir="ltr"
                        maxLength={20}
                      />
                      <span className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap font-mono bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded px-2 py-1.5">
                        {field.value || "FACT-"}{new Date().getFullYear()}-001
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {dict.invoicePrefixDesc}
                  </FormDescription>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Submit Actions */}
        <div className={cn("flex flex-col sm:flex-row items-center gap-4 pt-4", isRTL ? "justify-start sm:flex-row-reverse" : "justify-start")}>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all font-semibold rounded-lg shadow-sm"
          >
            {isSubmitting ? dict.savingText : dict.saveButton}
          </Button>

          {saveStatus === "success" && (
            <p className="text-sm text-green-500 font-medium animate-fade-in">
              {language === "ar"
                ? "تم حفظ الإعدادات بنجاح!"
                : language === "fr"
                ? "Paramètres enregistrés avec succès!"
                : "Settings saved successfully!"}
            </p>
          )}

          {saveStatus === "error" && (
            <p className="text-sm text-red-500 font-medium animate-fade-in">
              {language === "ar"
                ? "حدث خطأ أثناء حفظ الإعدادات."
                : language === "fr"
                ? "Une erreur est survenue lors de l'enregistrement."
                : "An error occurred while saving settings."}
            </p>
          )}
        </div>
      </form>
    </Form>
  );
}
