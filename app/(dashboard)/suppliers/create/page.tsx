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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

const toOptionalText = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export default function CreateSupplierPage() {
  const { dir, t, language } = useI18n();
  const isRTL = dir === "rtl";
  const router = useRouter();
  const createSupplier = useMutation(api.suppliers.createSupplier);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const supplierSchema = z.object({
    name: z.string().min(2, t("fieldRequired")),
    email: z.preprocess(toOptionalText, z.string().email().optional()),
    phone: z.preprocess(toOptionalText, z.string().optional()),
    address: z.preprocess(toOptionalText, z.string().optional()),
    nif: z.preprocess(toOptionalText, z.string().optional()),
    rc: z.preprocess(toOptionalText, z.string().optional()),
    paymentTerms: z.preprocess(toOptionalText, z.string().optional()),
  });

  type SupplierFormValues = z.infer<typeof supplierSchema>;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      nif: "",
      rc: "",
      paymentTerms: "",
    },
  });

  const onSubmit = async (values: SupplierFormValues) => {
    setSubmitError(null);

    try {
      await createSupplier({
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        nif: values.nif,
        rc: values.rc,
        paymentTerms: values.paymentTerms,
      });
      router.push("/suppliers");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create supplier");
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-[var(--color-bg-primary)] py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] p-8 border border-[var(--color-border)]">
          <Link href="/suppliers">
            <Button variant="outline" className="mb-6 flex items-center gap-2">
              {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              {t("backToSuppliers")}
            </Button>
          </Link>

          <h1 className="mb-2 text-2xl font-bold">{t("addNewSupplier")}</h1>
          <p className="mb-6 text-sm text-[var(--color-text-muted)]">{t("supplierFormDesc")}</p>

          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} dir={dir}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className={isRTL ? "text-right" : "text-left"}>
                    <FormLabel>{t("supplierName")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("enterName")} className={isRTL ? "text-right" : "text-left"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className={isRTL ? "text-right" : "text-left"}>
                      <FormLabel>{t("email")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="name@example.com" className="text-left" dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className={isRTL ? "text-right" : "text-left"}>
                      <FormLabel>{t("phone")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="0550 00 00 00" className="text-left" dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nif"
                  render={({ field }) => (
                    <FormItem className={isRTL ? "text-right" : "text-left"}>
                      <FormLabel>{t("fiscalId")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123456789..." className="text-left" dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rc"
                  render={({ field }) => (
                    <FormItem className={isRTL ? "text-right" : "text-left"}>
                      <FormLabel>{t("rc")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="RC-12345..." className="text-left" dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className={isRTL ? "text-right" : "text-left"}>
                    <FormLabel>{t("address")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("address")} className={isRTL ? "text-right" : "text-left"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem className={isRTL ? "text-right" : "text-left"}>
                    <FormLabel>{t("paymentTerms")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 30 days" className={isRTL ? "text-right" : "text-left"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </p>
              )}

              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? t("saving") : t("saveSupplier")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
