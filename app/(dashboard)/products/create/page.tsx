"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ArrowLeft, Package, Barcode, Tag, DollarSign, Box, Calendar } from "lucide-react";

const toOptionalText = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const toRequiredNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
};

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  skuOrBarcode: z.preprocess(toOptionalText, z.string().optional()),
  buyPrice: z.preprocess(toRequiredNumber, z.number().nonnegative()),
  sellPrice: z.preprocess(toRequiredNumber, z.number().nonnegative()),
  initialStock: z.preprocess(toRequiredNumber, z.number().int().nonnegative()),
  minStockLevel: z.preprocess(toRequiredNumber, z.number().int().nonnegative()),
  taxRate: z.preprocess(toRequiredNumber, z.number()),
  expiryDate: z.preprocess((val) => val === "" ? undefined : val, z.string().optional()),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const { dir, t, language } = useI18n();
  const router = useRouter();
  const createProduct = useMutation(api.products.createProduct);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRTL = dir === "rtl";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      skuOrBarcode: "",
      buyPrice: 0,
      sellPrice: 0,
      initialStock: 0,
      minStockLevel: 10,
      taxRate: 19,
      expiryDate: undefined,
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await createProduct({
        name: values.name,
        skuOrBarcode: values.skuOrBarcode,
        buyPrice: values.buyPrice,
        sellPrice: values.sellPrice,
        initialStock: values.initialStock,
        minStockLevel: values.minStockLevel,
        taxRate: values.taxRate,
        expiryDate: values.expiryDate ? new Date(values.expiryDate).getTime() : undefined,
      });
      router.push("/products");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-[var(--color-bg-primary)] py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] p-8 border border-[var(--color-border)] shadow-md">
          <Link href="/products">
            <Button variant="ghost" className={cn("mb-6", isRTL && "flex-row-reverse")}>
              <ArrowLeft className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t("backToProducts")}
            </Button>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">{t("createProductTitle")}</h1>
            <p className="text-[var(--color-text-muted)]">{t("productFormTitle")}</p>
          </div>

          <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Product Information Section */}
              <div className="space-y-6 pb-8 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--color-primary)] bg-opacity-10">
                    <Package className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <h2 className="text-label">{language === "ar" ? "معلومات المنتج" : "Product Information"}</h2>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("productName")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={language === "ar" ? "أدخل اسم المنتج..." : "Enter product name..."}
                          className="text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skuOrBarcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Barcode className="h-4 w-4" />
                        {t("skuBarcode")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="off"
                          placeholder={language === "ar" ? "المنتج SKU أو الرمز الشريطي..." : "Product SKU or barcode..."}
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormDescription>{t("barcodeHint")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pricing Section */}
              <div className="space-y-6 pb-8 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--color-success)] bg-opacity-10">
                    <DollarSign className="h-5 w-5 text-[var(--color-success)]" />
                  </div>
                  <h2 className="text-label">{language === "ar" ? "التسعير" : "Pricing"}</h2>
                </div>

                <div className={cn("grid gap-6 md:grid-cols-2", isRTL && "auto-cols-fr")}>
                  <FormField
                    control={form.control}
                    name="buyPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("buyPrice")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-medium">د.ج</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={field.value ?? ""}
                              onChange={(event) => {
                                field.onChange(toRequiredNumber(event.target.value) ?? 0);
                              }}
                              className="font-mono-price text-lg pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sellPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("sellPrice")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-medium">د.ج</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={field.value ?? ""}
                              onChange={(event) => {
                                field.onChange(toRequiredNumber(event.target.value) ?? 0);
                              }}
                              className="font-mono-price text-lg pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Stock Section */}
              <div className="space-y-6 pb-8 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--color-warning)] bg-opacity-10">
                    <Box className="h-5 w-5 text-[var(--color-warning)]" />
                  </div>
                  <h2 className="text-label">{language === "ar" ? "المخزون" : "Stock"}</h2>
                </div>

                <div className={cn("grid gap-6 md:grid-cols-2", isRTL && "auto-cols-fr")}>
                  <FormField
                    control={form.control}
                    name="initialStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("initialStock")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={field.value ?? ""}
                            onChange={(event) => {
                              field.onChange(toRequiredNumber(event.target.value) ?? 0);
                            }}
                            className="font-mono-price text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("minStockLevel")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="10"
                            value={field.value ?? ""}
                            onChange={(event) => {
                              field.onChange(toRequiredNumber(event.target.value) ?? 0);
                            }}
                            className="font-mono-price text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Tax Section */}
              <div className="space-y-6 pb-8 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--color-primary)] bg-opacity-10">
                    <Tag className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <h2 className="text-label">{language === "ar" ? "الضريبة" : "Tax"}</h2>
                </div>

                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("taxRate")}</FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("taxRate")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="9">9%</SelectItem>
                          <SelectItem value="19">19%</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Expiry Date Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--color-info)] bg-opacity-10">
                    <Calendar className="h-5 w-5 text-[var(--color-info)]" />
                  </div>
                  <h2 className="text-label">{language === "ar" ? "تاريخ انتهاء الصلاحية" : "Expiry Date"}</h2>
                </div>

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "ar" ? "تاريخ انتهاء الصلاحية (اختياري)" : "Expiry Date (Optional)"}</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ""}
                          onChange={(event) => field.onChange(event.target.value)}
                          className="font-mono text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="rounded-md border border-[var(--color-danger)] bg-[var(--color-danger)] bg-opacity-10 px-4 py-3 text-sm text-[var(--color-danger)]">
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 text-base font-semibold"
                >
                  {isSubmitting ? (
                    <>{t("saving")}...</>
                  ) : (
                    t("saveProduct")
                  )}
                </Button>
                <Link href="/products" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-semibold"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
