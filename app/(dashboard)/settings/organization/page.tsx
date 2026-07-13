"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePermission } from "@/hooks/usePermission";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Building2, DollarSign, Hash } from "lucide-react";

export default function OrganizationSettingsPage() {
  const { t, dir, language } = useI18n();
  const isRTL = dir === "rtl";
  const { hasPermission: canManageSettings, isLoading: isSettingsLoading } = usePermission("settings.manage");

  const orgSettings = useQuery(api.organization_settings.get);
  const updateSettings = useMutation(api.organization_settings.update);

  const [formData, setFormData] = useState({
    defaultCurrency: orgSettings?.defaultCurrency || "DZD",
    isMultiCurrencyEnabled: orgSettings?.isMultiCurrencyEnabled || false,
    defaultTvaRate: orgSettings?.defaultTvaRate || 19,
    invoicePrefix: orgSettings?.invoicePrefix || "FACT-2026-",
  });

  const [isSaving, setIsSaving] = useState(false);

  if (isSettingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!canManageSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{language === "ar" ? "ليس لديك صلاحية الوصول" : "Access denied"}</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
    } catch (error) {
      console.error("Failed to update settings:", error);
      alert(language === "ar" ? "فشل حفظ الإعدادات" : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className={isRTL ? "flex-row-reverse" : "flex items-center gap-2"}>
        <Building2 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "إعدادات المنظمة" : language === "fr" ? "Paramètres de l'organisation" : "Organization Settings"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className={isRTL ? "flex-row-reverse" : "flex items-center gap-2"}>
              <DollarSign className="h-5 w-5" />
              {language === "ar" ? "إعدادات العملة" : language === "fr" ? "Paramètres de devise" : "Currency Settings"}
            </CardTitle>
            <CardDescription>
              {language === "ar" ? "تكوين العملة الافتراضية وتعدد العملات" : language === "fr" ? "Configurer la devise par défaut et le multi-devises" : "Configure default currency and multi-currency support"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">
                {language === "ar" ? "العملة الافتراضية" : language === "fr" ? "Devise par défaut" : "Default Currency"}
              </Label>
              <Input
                id="defaultCurrency"
                value={formData.defaultCurrency}
                onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                placeholder="DZD"
                className="max-w-xs"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isMultiCurrencyEnabled">
                  {language === "ar" ? "تفعيل تعدد العملات" : language === "fr" ? "Activer le multi-devises" : "Enable Multi-Currency"}
                </Label>
                <p className="text-sm text-gray-500">
                  {language === "ar" ? "السماح بالعملات المتعددة للفواتير والمنتجات" : language === "fr" ? "Permettre plusieurs devises pour les factures et produits" : "Allow multiple currencies for invoices and products"}
                </p>
              </div>
              <Switch
                id="isMultiCurrencyEnabled"
                checked={formData.isMultiCurrencyEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isMultiCurrencyEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle className={isRTL ? "flex-row-reverse" : "flex items-center gap-2"}>
              <DollarSign className="h-5 w-5" />
              {language === "ar" ? "إعدادات الضريبة" : language === "fr" ? "Paramètres fiscaux" : "Tax Settings"}
            </CardTitle>
            <CardDescription>
              {language === "ar" ? "تكوين معدل الضريبة الافتراضي (TVA)" : language === "fr" ? "Configurer le taux de TVA par défaut" : "Configure default VAT/TVA rate"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultTvaRate">
                {language === "ar" ? "معدل TVA الافتراضي (%)" : language === "fr" ? "Taux TVA par défaut (%)" : "Default TVA Rate (%)"}
              </Label>
              <Input
                id="defaultTvaRate"
                type="number"
                value={formData.defaultTvaRate}
                onChange={(e) => setFormData({ ...formData, defaultTvaRate: parseFloat(e.target.value) })}
                min="0"
                max="100"
                step="1"
                className="max-w-xs"
              />
              <p className="text-sm text-gray-500">
                {language === "ar" ? "يمكن تجاوز هذا لكل منتج على حدة" : language === "fr" ? "Peut être remplacé par produit" : "Can be overridden per product"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Numbering */}
        <Card>
          <CardHeader>
            <CardTitle className={isRTL ? "flex-row-reverse" : "flex items-center gap-2"}>
              <Hash className="h-5 w-5" />
              {language === "ar" ? "ترقيم الفواتير" : language === "fr" ? "Numérotation des factures" : "Invoice Numbering"}
            </CardTitle>
            <CardDescription>
              {language === "ar" ? "تكوين بادئة رقم الفاتورة للتسلسل التلقائي" : language === "fr" ? "Configurer le préfixe de numéro de facture pour la numérotation automatique" : "Configure invoice number prefix for automatic sequential numbering"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">
                {language === "ar" ? "بادئة رقم الفاتورة" : language === "fr" ? "Préfixe de numéro de facture" : "Invoice Number Prefix"}
              </Label>
              <Input
                id="invoicePrefix"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                placeholder="FACT-2026-"
                className="max-w-xs"
              />
              <p className="text-sm text-gray-500">
                {language === "ar" ? "مثال: FACT-2026- سيتم إضافة رقم تسلسلي تلقائياً" : language === "fr" ? "Exemple: FACT-2026- Un numéro séquentiel sera ajouté automatiquement" : "Example: FACT-2026- A sequential number will be added automatically"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className={isRTL ? "flex-row-reverse" : ""}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving
              ? (language === "ar" ? "جاري الحفظ..." : language === "fr" ? "Enregistrement..." : "Saving...")
              : (language === "ar" ? "حفظ الإعدادات" : language === "fr" ? "Enregistrer" : "Save Settings")}
          </Button>
        </div>
      </form>
    </div>
  );
}
