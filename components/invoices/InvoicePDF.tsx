"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { formatNumber, formatCurrency } from "@/lib/taxCalculator";
import { formatAmountInWords, reshapeArabicText } from "@/lib/arabicUtils";

// Register fonts for bilingual support
Font.register({
  family: "Amiri",
  src: "https://fonts.gstatic.com/s/amiri/v0/J7aHnp1-i-UqVCgVLDCcV-BJ.ttf",
  fontStyle: "normal",
  fontWeight: "normal",
});

Font.register({
  family: "Amiri-Bold",
  src: "https://fonts.gstatic.com/s/amiri/v0/J7ahnp1-i-UqVCgVLDCcV-BJ.ttf",
  fontStyle: "normal",
  fontWeight: "bold",
});

const styles = StyleSheet.create({
  // A4 Official Invoice Styles
  documentA4: {
    width: "210mm",
    height: "297mm",
  },

  pageA4: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },

  // 80mm Roll (Receipt) Styles
  documentRoll: {
    width: "80mm",
    height: "999mm",
  },

  pageRoll: {
    padding: 10,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  // Header Styles
  headerContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 15,
  },

  headerA4: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#1f2937",
  },

  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },

  storeInfo: {
    fontSize: 9,
    marginBottom: 3,
    color: "#374151",
    lineHeight: 1.4,
  },

  storeInfoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },

  label: {
    width: 40,
    fontWeight: "bold",
    color: "#1f2937",
  },

  value: {
    flex: 1,
    color: "#374151",
  },

  // Invoice Type Badge
  invoiceTypeContainer: {
    position: "absolute",
    top: 40,
    right: 40,
    backgroundColor: "#3b82f6",
    padding: "8 12",
    borderRadius: 4,
  },

  invoiceTypeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Title Section
  titleContainer: {
    marginBottom: 20,
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },

  invoiceNumber: {
    fontSize: 10,
    color: "#666",
    marginBottom: 3,
  },

  // Customer Section
  customerSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    textTransform: "uppercase",
    color: "#1f2937",
  },

  customerInfo: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#374151",
  },

  // Table Styles
  tableContainer: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "#e5e7eb",
    borderBottomColor: "#e5e7eb",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    fontWeight: "bold",
    fontSize: 9,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    fontSize: 9,
  },

  tableCol: {
    flex: 1,
  },

  tableColDescription: {
    flex: 3,
  },

  tableColNumber: {
    textAlign: "right",
    width: 60,
  },

  // Totals Section
  totalsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },

  totalsRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingRight: 100,
  },

  totalsLabel: {
    flex: 1,
    fontSize: 10,
    color: "#374151",
  },

  totalsValue: {
    width: 80,
    textAlign: "right",
    fontSize: 10,
    color: "#000",
    fontWeight: "500",
  },

  totalAmountRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingRight: 100,
    backgroundColor: "#dbeafe",
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 3,
  },

  totalAmountLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },

  totalAmountValue: {
    width: 80,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e40af",
  },

  // TVA Table
  tvaTableContainer: {
    marginTop: 15,
    marginBottom: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  tvaTableTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    color: "#1f2937",
  },

  tvaTableRow: {
    flexDirection: "row",
    marginBottom: 4,
    fontSize: 9,
  },

  tvaTableCol: {
    flex: 1,
  },

  tvaTableColNumber: {
    width: 60,
    textAlign: "right",
  },

  // Footer Styles
  footerContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    fontSize: 8,
    color: "#666",
    textAlign: "center",
    lineHeight: 1.6,
  },

  amountInWords: {
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 3,
    fontSize: 9,
    fontStyle: "italic",
    color: "#92400e",
  },

  qrCodeContainer: {
    marginTop: 20,
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  qrCodePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#f3f4f6",
    border: "1 solid #d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  qrCodeText: {
    fontSize: 8,
    color: "#999",
  },

  // Roll Receipt Styles
  rollHeader: {
    textAlign: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },

  rollTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 3,
  },

  rollInvoiceType: {
    fontSize: 8,
    marginBottom: 3,
    color: "#666",
  },

  rollItemsTable: {
    marginBottom: 10,
  },

  rollTotalsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },

  rollTotalRow: {
    flexDirection: "row",
    marginBottom: 3,
    fontSize: 9,
  },

  rollTotalLabel: {
    flex: 1,
  },

  rollTotalValue: {
    width: 40,
    textAlign: "right",
    fontWeight: "bold",
  },
});

interface InvoiceData {
  invoiceNumber: string;
  isOfficial: boolean;
  paymentMethod: "cash" | "credit" | "check";
  invoiceDate?: string;
  dueDate?: string;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    nif?: string;
    rc?: string;
  } | null;
  store?: {
    name: string;
    address: string;
    phone: string;
    nif: string;
    rc: string;
    ai?: string;
    nis?: string;
  };
  items: Array<{
    description?: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    itemTotal: number;
  }>;
  subtotal: number;
  tvaAmount: number;
  timbreFiscal: number;
  totalAmount: number;
  notes?: string;
  amountPaid?: number;
}

interface InvoicePDFProps {
  invoice: InvoiceData;
  layout?: "a4" | "roll";
  language?: "fr" | "ar";
}

const OfficialA4Invoice: React.FC<{ invoice: InvoiceData }> = ({ invoice }) => {
  const store = invoice.store ?? {
    name: "Salama ERP",
    address: "",
    phone: "",
    nif: "",
    rc: "",
    ai: undefined,
    nis: undefined,
  };
  const invoiceDate = invoice.invoiceDate ?? "";
  const customer = invoice.customer ?? {
    name: "Client",
    email: undefined,
    phone: undefined,
    address: undefined,
    nif: undefined,
    rc: undefined,
  };

  return (
    <Page size="A4" style={styles.pageA4}>
    {/* Header */}
    <View style={styles.headerA4}>
      <Text style={styles.storeName}>{store.name}</Text>
      <View style={styles.storeInfoRow}>
        <Text style={styles.label}>Adresse:</Text>
        <Text style={styles.value}>{store.address}</Text>
      </View>
      <View style={styles.storeInfoRow}>
        <Text style={styles.label}>Tél:</Text>
        <Text style={styles.value}>{store.phone}</Text>
      </View>
      <View style={styles.storeInfoRow}>
        <Text style={styles.label}>NIF:</Text>
        <Text style={styles.value}>{store.nif}</Text>
      </View>
      <View style={styles.storeInfoRow}>
        <Text style={styles.label}>RC:</Text>
        <Text style={styles.value}>{store.rc}</Text>
      </View>
      {store.ai && (
        <View style={styles.storeInfoRow}>
          <Text style={styles.label}>AI:</Text>
          <Text style={styles.value}>{store.ai}</Text>
        </View>
      )}
      {store.nis && (
        <View style={styles.storeInfoRow}>
          <Text style={styles.label}>NIS:</Text>
          <Text style={styles.value}>{store.nis}</Text>
        </View>
      )}
    </View>

    {/* Title */}
    <View style={styles.titleContainer}>
      <Text style={styles.title}>FACTURE</Text>
      <Text style={styles.invoiceNumber}>
        Numéro: {invoice.invoiceNumber}
      </Text>
      <Text style={styles.invoiceNumber}>
        Date: {invoiceDate}
      </Text>
    </View>

    {/* Customer Section */}
    <View style={styles.customerSection}>
      <Text style={styles.sectionTitle}>Client</Text>
      <Text style={styles.customerInfo}>{customer.name}</Text>
      {customer.address && (
        <Text style={styles.customerInfo}>{customer.address}</Text>
      )}
      {customer.phone && (
        <Text style={styles.customerInfo}>Tél: {customer.phone}</Text>
      )}
      {customer.email && (
        <Text style={styles.customerInfo}>Email: {customer.email}</Text>
      )}
      {customer.nif && (
        <Text style={styles.customerInfo}>NIF: {customer.nif}</Text>
      )}
      {customer.rc && (
        <Text style={styles.customerInfo}>RC: {customer.rc}</Text>
      )}
    </View>

    {/* Items Table */}
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCol, styles.tableColDescription]}>
          Description
        </Text>
        <Text style={styles.tableCol}>Qté</Text>
        <Text style={styles.tableCol}>P.U</Text>
        <Text style={styles.tableCol}>TVA%</Text>
        <Text style={[styles.tableCol, styles.tableColNumber]}>Total</Text>
      </View>
      {invoice.items.map((item, idx) => (
        <View key={idx} style={styles.tableRow}>
          <Text style={[styles.tableCol, styles.tableColDescription]}>
            {item.description || item.productName || ""}
          </Text>
          <Text style={styles.tableCol}>{formatNumber(item.quantity, "fr", 0, 0)}</Text>
          <Text style={styles.tableCol}>
            {formatNumber(item.unitPrice, "fr", 0, 2)}
          </Text>
          <Text style={styles.tableCol}>{item.taxRate}%</Text>
          <Text style={[styles.tableCol, styles.tableColNumber]}>
            {formatNumber(item.itemTotal, "fr", 0, 2)}
          </Text>
        </View>
      ))}
    </View>

    {/* TVA Table */}
    <View style={styles.tvaTableContainer}>
      <Text style={styles.tvaTableTitle}>Détail TVA</Text>
      <View style={styles.tvaTableRow}>
        <Text style={styles.tvaTableCol}>Base H.T</Text>
        <Text style={styles.tvaTableColNumber}>
          {formatNumber(invoice.subtotal, "fr", 0, 2)}
        </Text>
      </View>
      <View style={styles.tvaTableRow}>
        <Text style={styles.tvaTableCol}>TVA (19%)</Text>
        <Text style={styles.tvaTableColNumber}>
          {formatNumber(invoice.tvaAmount, "fr", 0, 2)}
        </Text>
      </View>
      {invoice.isOfficial && invoice.paymentMethod === "cash" && (
        <View style={styles.tvaTableRow}>
          <Text style={styles.tvaTableCol}>Timbre Fiscal (1%)</Text>
          <Text style={styles.tvaTableColNumber}>
            {formatNumber(invoice.timbreFiscal, "fr", 0, 2)}
          </Text>
        </View>
      )}
    </View>

    {/* Totals */}
    <View style={styles.totalsContainer}>
      <View style={styles.totalsRow}>
        <Text style={styles.totalsLabel}>Sous-total:</Text>
        <Text style={styles.totalsValue}>
          {formatNumber(invoice.subtotal, "fr", 0, 2)}
        </Text>
      </View>
      <View style={styles.totalsRow}>
        <Text style={styles.totalsLabel}>TVA:</Text>
        <Text style={styles.totalsValue}>{formatNumber(invoice.tvaAmount, "fr", 0, 2)}</Text>
      </View>
      {invoice.isOfficial && invoice.paymentMethod === "cash" && (
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Timbre Fiscal:</Text>
          <Text style={styles.totalsValue}>
            {formatNumber(invoice.timbreFiscal, "fr", 0, 2)}
          </Text>
        </View>
      )}
      <View style={styles.totalAmountRow}>
        <Text style={styles.totalAmountLabel}>TOTAL TTC:</Text>
        <Text style={styles.totalAmountValue}>
          {formatNumber(invoice.totalAmount, "fr", 0, 2)} DZD
        </Text>
      </View>
    </View>

    {/* Amount in Words */}
    <View style={styles.amountInWords}>
      <Text>
        Arrêté la présente facture à la somme de{" "}
        {formatAmountInWords(invoice.totalAmount, "dinars algériens")}
      </Text>
    </View>

    {/* Notes */}
    {invoice.notes && (
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={{ fontSize: 9, color: "#374151" }}>{invoice.notes}</Text>
      </View>
    )}

    {/* Footer */}
    <View style={styles.footerContainer}>
      <Text>Merci pour votre achat</Text>
      <Text>Les retours sont acceptés dans un délai de 7 jours</Text>
      <Text>Facture générée digitalement - Valeur légale</Text>
    </View>

    {/* QR Code Placeholder */}
    <View style={styles.qrCodeContainer}>
      <View style={styles.qrCodePlaceholder}>
        <Text style={styles.qrCodeText}>QR Code</Text>
      </View>
    </View>
    </Page>
  );
};

const InternalRollReceipt: React.FC<{ invoice: InvoiceData }> = ({ invoice }) => {
  const store = invoice.store ?? {
    name: "Salama ERP",
    address: "",
    phone: "",
    nif: "",
    rc: "",
    ai: undefined,
    nis: undefined,
  };
  const invoiceDate = invoice.invoiceDate ?? "";
  const customer = invoice.customer ?? {
    name: "Client",
    email: undefined,
    phone: undefined,
    address: undefined,
    nif: undefined,
    rc: undefined,
  };

  return (
    <Page size={[226, 999]} style={styles.pageRoll}>
    {/* Header */}
    <View style={styles.rollHeader}>
      <Text style={styles.rollTitle}>{store.name}</Text>
      <Text style={styles.rollInvoiceType}>
        {invoice.isOfficial ? "FACTURE" : "BON DE LIVRAISON"}
      </Text>
      <Text style={{ fontSize: 8 }}>
        {invoice.invoiceNumber}
      </Text>
    </View>

    {/* Customer */}
    <View style={{ marginBottom: 8, fontSize: 8, borderBottomWidth: 1, paddingBottom: 5 }}>
      <Text style={{ fontWeight: "bold" }}>{customer.name}</Text>
    </View>

    {/* Items */}
    <View style={styles.rollItemsTable}>
      {invoice.items.map((item, idx) => (
        <View key={idx} style={{ marginBottom: 5, fontSize: 8 }}>
          <Text>{item.description || item.productName || ""}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text>
              {formatNumber(item.quantity, "fr", 0, 0)} x{" "}
              {formatNumber(item.unitPrice, "fr", 0, 2)}
            </Text>
            <Text style={{ fontWeight: "bold" }}>
              {formatNumber(item.itemTotal, "fr", 0, 2)}
            </Text>
          </View>
        </View>
      ))}
    </View>

    {/* Totals */}
    <View style={styles.rollTotalsSection}>
      <View style={styles.rollTotalRow}>
        <Text style={styles.rollTotalLabel}>Sous-total</Text>
        <Text style={styles.rollTotalValue}>
          {formatNumber(invoice.subtotal, "fr", 0, 2)}
        </Text>
      </View>
      <View style={styles.rollTotalRow}>
        <Text style={styles.rollTotalLabel}>TVA</Text>
        <Text style={styles.rollTotalValue}>
          {formatNumber(invoice.tvaAmount, "fr", 0, 2)}
        </Text>
      </View>
      {invoice.isOfficial && invoice.paymentMethod === "cash" && (
        <View style={styles.rollTotalRow}>
          <Text style={styles.rollTotalLabel}>Timbre</Text>
          <Text style={styles.rollTotalValue}>
            {formatNumber(invoice.timbreFiscal, "fr", 0, 2)}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.rollTotalRow,
          { paddingTop: 5, borderTopWidth: 1, fontWeight: "bold", fontSize: 10 },
        ]}
      >
        <Text style={{ fontWeight: "bold" }}>TOTAL</Text>
        <Text style={[styles.rollTotalValue, { fontWeight: "bold" }]}>
          {formatNumber(invoice.totalAmount, "fr", 0, 2)}
        </Text>
      </View>
    </View>

    {/* Footer */}
    <View
      style={{
        marginTop: 15,
        textAlign: "center",
        fontSize: 7,
        color: "#999",
        borderTopWidth: 1,
        paddingTop: 10,
      }}
    >
      <Text>Merci</Text>
      <Text>{invoiceDate}</Text>
    </View>
    </Page>
  );
};

export const InvoicePDF: React.FC<InvoicePDFProps> = ({
  invoice,
  layout = "a4",
}) => {
  if (layout === "roll") {
    return (
      <Document>
        <InternalRollReceipt invoice={invoice} />
      </Document>
    );
  }

  return (
    <Document>
      <OfficialA4Invoice invoice={invoice} />
    </Document>
  );
};
