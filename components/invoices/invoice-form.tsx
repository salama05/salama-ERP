"use client"

import React, { useState, useCallback, useMemo } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Combobox } from "@/components/ui/combobox"
import { calculateTaxPreview, formatCurrency } from "@/lib/taxCalculator"
import { Trash2, Plus, AlertCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
})

const createInvoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  isOfficial: z.boolean().default(false),
  paymentMethod: z.enum(["cash", "credit", "check"]),
  amountPaid: z.number().optional().default(0),
  notes: z.string().optional(),
})

type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>

interface InvoiceFormProps {
  onSuccess?: () => void
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const { t, language, dir } = useI18n()
  const isRTL = dir === "rtl"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch customers and products from Convex
  const customers = useQuery(api.customers.listCustomers, {}) || []
  const products = useQuery(api.products.listProducts, {}) || []

  // Get createInvoice mutation
  const createInvoice = useMutation(api.invoices.createInvoice)

  const form = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      customerId: "",
      items: [{ productId: "", quantity: 1 }],
      isOfficial: false,
      paymentMethod: "cash",
      amountPaid: 0,
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // Watch form values for real-time tax preview
  const watchedItems = form.watch("items")
  const watchedIsOfficial = form.watch("isOfficial")
  const watchedPaymentMethod = form.watch("paymentMethod")

  // Calculate tax preview
  const taxPreview = useMemo(() => {
    const itemsWithPrices = watchedItems
      .map((item) => {
        const product = products.find((p) => p._id === item.productId)
        if (!product) return null
        return {
          quantity: item.quantity || 0,
          unitPrice: product.price || 0,
          taxRate: product.taxRate || 19,
        }
      })
      .filter(Boolean) as Array<{
        quantity: number
        unitPrice: number
        taxRate: number
      }>

    return calculateTaxPreview(
      itemsWithPrices,
      watchedIsOfficial,
      watchedPaymentMethod
    )
  }, [watchedItems, watchedIsOfficial, watchedPaymentMethod, products])

  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: c.name,
  }))

  const productOptions = products.map((p) => ({
    value: p._id,
    label: `${p.name} (${formatCurrency(p.price, language)})`,
  }))

  const onSubmit = async (values: CreateInvoiceFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createInvoice({
        customerId: values.customerId as any,
        items: values.items.map((item) => ({
          productId: item.productId as any,
          quantity: item.quantity,
        })),
        isOfficial: values.isOfficial,
        paymentMethod: values.paymentMethod as "cash" | "credit" | "check",
        amountPaid: values.amountPaid,
        notes: values.notes,
      })

      // Success handling
      form.reset()
      onSuccess?.()
      alert(`Invoice created successfully: ${result.invoiceNumber}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create invoice"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-6", isRTL && "text-right")}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("createInvoice")}</h1>
        <p className="text-gray-600">
          {t("invoiceTitleDesc")}
        </p>
      </div>

      {error && (
        <div className={cn("mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3", isRTL && "flex-row-reverse")}>
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Invoice Type & Payment Method */}
          <div className={cn("grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg", isRTL && "text-right")}>
            <FormField
              control={form.control}
              name="isOfficial"
              render={({ field }) => (
                <FormItem className={cn("flex flex-row items-center justify-between p-3 bg-white rounded-lg border", isRTL && "flex-row-reverse")}>
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("officialFacture")}</FormLabel>
                    <p className="text-sm text-gray-500">
                      {field.value
                        ? t("officialFacture")
                        : t("internalBon")}
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">{t("paymentMethod")}</FormLabel>
                  <div className={cn("flex gap-4", isRTL && "flex-row-reverse")}>
                    {["cash", "credit", "check"].map((method) => (
                      <label key={method} className={cn("flex items-center gap-2 cursor-pointer", isRTL && "flex-row-reverse")}>
                        <input
                          type="radio"
                          value={method}
                          checked={field.value === method}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="capitalize text-sm">{t(method as "cash" | "credit" | "check")}</span>
                      </label>
                    ))}
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Customer Selection */}
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem className={cn(isRTL && "text-right")}>
                <FormLabel>{t("customer")}</FormLabel>
                <FormControl>
                  <Combobox
                    options={customerOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t("searchByCustomer")}
                    searchPlaceholder={t("searchCustomers")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Line Items */}
          <div className="space-y-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <h2 className="text-xl font-semibold">{t("items")}</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productId: "", quantity: 1 })}
                className={cn(isRTL && "flex-row-reverse")}
              >
                <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t("addProduct")}
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={cn("grid grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-lg", isRTL && "text-right")}
                  style={isRTL ? { direction: "rtl" } : {}}
                >
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem className="col-span-7">
                        <FormLabel>{t("productName")}</FormLabel>
                        <FormControl>
                          <Combobox
                            options={productOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder={t("searchByNameOrSku")}
                            searchPlaceholder={t("searchProducts")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>{t("qty")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 1)
                            }
                            className={cn(isRTL && "text-right")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="col-span-2 h-10"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Preview */}
          <div className={cn("grid grid-cols-4 gap-4 p-6 bg-blue-50 rounded-lg border border-blue-200", isRTL && "text-right")} style={isRTL ? { direction: "rtl" } : {}}>
            <div>
              <p className="text-sm text-gray-600">{t("subtotalHT")}</p>
              <p className="text-2xl font-bold">
                {formatCurrency(taxPreview.subtotal, language)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("taxTVA")} ({taxPreview.averageTaxRate}%)</p>
              <p className="text-2xl font-bold">
                {formatCurrency(taxPreview.tvaAmount, language)}
              </p>
            </div>
            {watchedIsOfficial && watchedPaymentMethod === "cash" && (
              <div>
                <p className="text-sm text-gray-600">{t("timbreFiscal")}</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(taxPreview.timbreFiscal, language)}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">{t("totalAmountTTC")}</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(taxPreview.totalAmount, language)}
              </p>
            </div>
          </div>

          {/* Amount Paid & Notes */}
          <div className={cn("grid grid-cols-2 gap-6", isRTL && "text-right")} style={isRTL ? { direction: "rtl" } : {}}>
            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amountPaid")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      className={cn(isRTL && "text-right")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("notes")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("notes")}
                      {...field}
                      className={cn(isRTL && "text-right")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("saving") : t("createInvoice")}
          </Button>
        </form>
      </Form>
    </div>
  )
}
