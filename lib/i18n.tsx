"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "fr" | "ar" | "en";
export const SUPPORTED_LANGUAGES = ["fr", "ar", "en"] as const;
export const FALLBACK_LANGUAGE: Language = "fr";
export const LANGUAGE_COOKIE_KEY = "saas_walaa_language";

export function getLocaleForLanguage(language: Language): string {
  if (language === "ar") return "ar-DZ";
  if (language === "en") return "en-US";
  return "fr-FR";
}

/**
 * Format a number as currency using the correct locale for the active language.
 * Use this everywhere instead of hardcoded .toLocaleString("fr-DZ", ...).
 */
export function formatCurrency(
  amount: number,
  language: Language,
  currency = "DZD"
): string {
  const locale = getLocaleForLanguage(language);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a plain number (no currency symbol) using the correct locale.
 */
export function formatNumber(
  amount: number,
  language: Language,
  options?: Intl.NumberFormatOptions
): string {
  const locale = getLocaleForLanguage(language);
  return new Intl.NumberFormat(locale, options).format(amount);
}

type TranslationKey =
  | "dashboard"
  | "products"
  | "customers"
  | "invoices"
  | "suppliers"
  | "overview"
  | "analytics"
  | "pos"
  | "sales"
  | "purchases"
  | "finance"
  | "settings"
  | "languageFrench"
  | "languageArabic"
  | "createNew"
  | "view"
  | "backToCustomers"
  | "backToProducts"
  | "backToInvoices"
  | "createCustomerTitle"
  | "createProductTitle"
  | "customerFormTitle"
  | "productFormTitle"
  | "customerName"
  | "email"
  | "phone"
  | "address"
  | "creditLimit"
  | "productName"
  | "skuBarcode"
  | "barcodeHint"
  | "buyPrice"
  | "sellPrice"
  | "initialStock"
  | "minStockLevel"
  | "taxRate"
  | "saveCustomer"
  | "saveProduct"
  | "saving"
  | "searchCustomers"
  | "searchProducts"
  | "searchInvoices"
  | "noCustomersFound"
  | "noProductsFound"
  | "noInvoicesFound"
  | "name"
  | "stock"
  | "totalDebt"
  | "settled"
  | "totalBalance"
  | "actions"
  | "price"
  | "invoiceNumber"
  | "type"
  | "amount"
  | "paid"
  | "debt"
  | "status"
  | "official"
  | "informal"
  | "paidStatus"
  | "partialStatus"
  | "draftStatus"
  | "searchByNameOrSku"
  | "searchByCustomer"
  | "searchByInvoice"
  | "stockAlerts"
  | "lowStockAlerts"
  | "allProductsInStock"
  | "topDebtors"
  | "total"
  | "salesTrend"
  | "topSellingProducts"
  | "noDataAvailable"
  | "noSalesDataAvailable"
  | "today"
  | "last7Days"
  | "thisMonth"
  | "analyticsDashboard"
  | "monitorBusinessPerformance"
  | "totalSales"
  | "netProfit"
  | "outstandingDebt"
  | "lowStockItems"
  | "totalTVACollected"
  | "taxLiability"
  | "averageProfitMargin"
  | "averageTransactionValue"
  | "creditUtilization"
  | "summary"
  | "afterCostOfGoods"
  | "fromCustomers"
  | "belowMinimumLevel"
  | "algerianVat"
  | "tvaAndTimbre"
  | "items"
  | "units"
  | "lowStock"
  | "high"
  | "low"
  // Request keys
  | "officialFacture"
  | "internalBon"
  | "addProduct"
  | "subtotalHT"
  | "taxTVA"
  | "timbreFiscal"
  | "totalAmountTTC"
  | "amountPaid"
  | "remainingDebt"
  | "paymentMethod"
  | "cash"
  | "credit"
  | "check"
  | "createInvoice"
  | "invoiceTitleDesc"
  | "customer"
  | "date"
  | "statusPaid"
  | "statusPartial"
  | "statusUnpaid"
  | "stockLevel"
  | "minStockAlert"
  | "supplier"
  | "totalRevenue"
  | "totalCollectedTVA"
  | "storeInformation"
  | "legalNumbers"
  | "commercialRegistry"
  | "fiscalId"
  | "statisticalId"
  | "qty"
  | "notes"
  | "storeProfile"
  | "security"
  | "storeName"
  | "storeLogo"
  | "inStock"
  | "outOfStock"
  | "newSupply"
  | "profitMargin"
  | "currency"
  | "currencyDefault"
  | "emailNotifications"
  | "emailNotificationsDesc"
  // New POS, Sales & Finance Keys
  | "posTitle"
  | "posDesc"
  | "retailMode"
  | "retailModeDesc"
  | "wholesaleMode"
  | "wholesaleModeDesc"
  | "salesManagement"
  | "salesDesc"
  | "orders"
  | "avgOrderValue"
  | "financeTitle"
  | "financeDesc"
  | "addExpense"
  | "viewLedger"
  // Purchases Form
  | "selectSupplier"
  | "scanEnterBarcode"
  | "purchasePriceUnit"
  | "quantityReceived"
  | "expiryDateList"
  | "totalOrderCost"
  | "savePurchaseOrder"
  // Invoices & Sales
  | "searchProduct"
  | "outOfStockWarning"
  | "discountDZD"
  | "applyTVA"
  | "confirmSalePrint"
  | "amountPaidCustomer"
  | "changeDue"
  // Products Forms
  | "productCategory"
  | "minStockAlertQuantity"
  | "skuAlreadyExists"
  | "creatingProduct"
  // Debt & Customers
  | "maxCreditLimit"
  | "recordPayment"
  | "currentTotalDebt"
  | "amountToDeduct"
  // Validation & Generics
  | "fieldRequired"
  | "positiveNumber"
  | "enterName"
  | "unknown"
  | "received"
  | "draft"
  | "noPurchases"
  | "backToPurchases"
  | "recordNewPurchase"
  | "purchaseFormDesc"
  | "supplierInfo"
  | "addItem"
  | "product"
  | "selectProduct"
  | "paymentInfo"
  | "cancel"
  | "backToSuppliers"
  | "addNewSupplier"
  | "supplierFormDesc"
  | "supplierName"
  | "rc"
  | "paymentTerms"
  | "saveSupplier"
  | "noSuppliersFound"
  | "noItemsAdded"
  // Detail pages
  | "back"
  | "notFound"
  | "customerNotFound"
  | "productNotFound"
  | "active"
  | "inactive"
  | "noSku"
  | "description"
  | "costPrice"
  | "barcode"
  // Finance
  | "totalIncome"
  | "totalExpenses"
  | "recentTransactions"
  | "viewAll"
  | "category"
  | "categoryPlaceholder"
  | "descriptionPlaceholder"
  | "save"
  | "ledgerTitle"
  | "reference"
  | "income"
  | "expense"
  | "purchase"
  | "invoice"
  | "noLedgerEntries"
  // POS
  | "cart"
  | "clear"
  | "cartEmpty"
  | "checkout"
  | "selectCustomer"
  | "error"
  | "officialInvoice"
  | "totalToPay"
  | "processing"
  | "confirmPayment"
  | "loading"
  | "search"
  // Page headers (hardcoded → i18n)
  | "productsPageKicker"
  | "productsPageTitle"
  | "productsPageDesc"
  | "customersPageKicker"
  | "customersPageTitle"
  | "customersPageDesc"
  | "invoicesPageKicker"
  | "invoicesPageTitle"
  | "invoicesPageDesc"
  | "suppliersPageKicker"
  | "suppliersPageTitle"
  | "suppliersPageDesc"
  | "purchasesPageKicker"
  | "purchasesPageTitle"
  | "purchasesPageDesc"
  // Settings inline strings
  | "storeSettings"
  | "settingsLanguage"
  | "settingsLanguageDesc"
  // Table & dialog actions
  | "edit"
  | "delete"
  | "close"
  | "editProduct"
  | "editProductDesc"
  | "deleteProduct"
  | "deleteProductConfirm"
  | "productDetails"
  | "productDetailsDesc"
  | "editCustomer"
  | "editCustomerDesc"
  | "deleteCustomer"
  | "deleteCustomerConfirm"
  | "customerDetails"
  | "customerDetailsDesc"
  // Empty-state helpers
  | "tryDifferentKeywords"
  | "startAddingProduct"
  | "startAddingCustomer"
  | "startAddingInvoice"
  | "productsCount"
  | "customersCount"
  | "invoicesCount"
  // Access control
  | "accessDenied"
  | "accessDeniedDesc"
  // Error messages
  | "failedToUpdate"
  | "failedToDelete"
  | "failedToCreate"
  // Finance / analytics extra
  | "todaySales"
  // Page descriptions
  | "overviewPageTitle"
  | "overviewPageDesc"
  | "liveOperationsBoard"
  | "upFromYesterday"
  | "downFromYesterday"
  | "recentSales"
  | "topProducts"
  | "noDataAvailableYet"
  | "noSalesDataAvailableYet"
  | "auditLog"
  | "allUsers"
  | "allEntities"
  | "allActions"
  | "details"
  | "changes"
  | "noLogs"
  | "loadMore"
  | "oldValue"
  | "newValue"
  | "field"
  | "customPermissions"
  | "manageUsers"
  | "role"
  | "lastLogin"
  | "deactivate"
  | "reactivate"
  | "inviteUser"
  // Public / marketing page
  | "heroKicker"
  | "heroTitle"
  | "heroDesc"
  | "heroCtaStart"
  | "heroCtaOpenDashboard"
  | "featureInventoryTitle"
  | "featureInventoryDesc"
  | "featureRevenueTitle"
  | "featureRevenueDesc"
  | "featureTrustTitle"
  | "featureTrustDesc"
  | "dashboardPreviewKicker"
  | "dashboardPreviewTitle"
  | "dashboardPreviewLive"
  | "dashboardPreviewRtlNote"
  | "dashboardPreviewRtlSub"
  | "dashboardPreviewMonthlyRevenue"
  | "dashboardPreviewOrdersToday"
  | "dashboardPreviewLowStock"
  | "dashboardPreviewMargin"
  // Sign-in page
  | "signInKicker"
  | "signInTitle"
  | "signInDesc"
  // Sign-up page
  | "signUpKicker"
  | "signUpTitle"
  | "signUpDesc"
  // Auth layout feature cards
  | "authFeatureRetailTitle"
  | "authFeatureRetailDesc"
  | "authFeatureRtlTitle"
  | "authFeatureRtlDesc"
  | "authFeatureMtTitle"
  | "authFeatureMtDesc"
  | "authFeatureZeroTitle"
  | "authFeatureZeroDesc";

type TranslationDictionary = Partial<Record<TranslationKey, string>>;

const translations: Record<Language, TranslationDictionary> = {
  fr: {
    dashboard: "Tableau de bord",
    products: "Produits",
    customers: "Clients",
    invoices: "Factures",
    overview: "Aperçu",
    analytics: "Analytique",
    pos: "Caisse",
    sales: "Ventes",
    suppliers: "Fournisseurs",
    purchases: "Achats",
    finance: "Finance",
    settings: "Paramètres",
    languageFrench: "Français",
    languageArabic: "العربية",
    createNew: "Créer",
    view: "Voir",
    backToCustomers: "Retour aux clients",
    backToProducts: "Retour aux produits",
    backToInvoices: "Retour aux factures",
    createCustomerTitle: "Créer un nouveau client",
    createProductTitle: "Créer un nouveau produit",
    customerFormTitle: "Informations client",
    productFormTitle: "Informations produit",
    customerName: "Nom",
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    creditLimit: "Limite de crédit",
    productName: "Nom du produit",
    skuBarcode: "SKU / Code-barres",
    barcodeHint: "Scannez ou saisissez le code-barres rapidement.",
    buyPrice: "Prix d'achat",
    sellPrice: "Prix de vente",
    initialStock: "Stock initial",
    minStockLevel: "Seuil minimum de stock",
    taxRate: "TVA",
    saveCustomer: "Créer le client",
    saveProduct: "Créer le produit",
    saving: "Enregistrement...",
    searchCustomers: "Rechercher par nom, email ou téléphone...",
    searchProducts: "Rechercher par nom, SKU ou code-barres...",
    searchInvoices: "Rechercher par numéro ou client...",
    noCustomersFound: "Aucun client trouvé",
    noProductsFound: "Aucun produit trouvé",
    noInvoicesFound: "Aucune facture trouvée",
    name: "Nom",
    stock: "Stock",
    totalDebt: "Dette totale",
    settled: "Soldé",
    totalBalance: "Solde total",
    actions: "Actions",
    price: "Prix",
    invoiceNumber: "N° facture",
    type: "Type",
    amount: "Montant",
    paid: "Payé",
    debt: "Dette",
    status: "Statut",
    official: "Officielle",
    informal: "Informelle",
    paidStatus: "Payée",
    partialStatus: "Partielle",
    draftStatus: "Brouillon",
    searchByNameOrSku: "Rechercher par nom ou SKU...",
    searchByCustomer: "Rechercher par client...",
    searchByInvoice: "Rechercher par numéro de facture...",
    stockAlerts: "Alertes de stock",
    lowStockAlerts: "Alertes de stock bas",
    allProductsInStock: "Tous les produits sont en stock",
    topDebtors: "Plus gros débiteurs",
    total: "Total",
    salesTrend: "Tendance des ventes",
    topSellingProducts: "Produits les plus vendus",
    noDataAvailable: "Aucune donnée disponible pour cette période",
    noSalesDataAvailable: "Aucune donnée de vente disponible",
    today: "Aujourd'hui",
    last7Days: "7 derniers jours",
    thisMonth: "Ce mois-ci",
    analyticsDashboard: "Tableau de bord analytique",
    monitorBusinessPerformance: "Suivez les performances de l'entreprise et les indicateurs clés",
    totalSales: "Ventes totales",
    netProfit: "Bénéfice net",
    outstandingDebt: "Dette impayée",
    lowStockItems: "Articles en stock faible",
    totalTVACollected: "TVA totale collectée",
    taxLiability: "Charge fiscale",
    averageProfitMargin: "Marge bénéficiaire moyenne",
    averageTransactionValue: "Valeur moyenne de transaction",
    creditUtilization: "Utilisation du crédit",
    summary: "Résumé",
    afterCostOfGoods: "Après coût des marchandises",
    fromCustomers: "De clients",
    belowMinimumLevel: "Sous le niveau minimum",
    algerianVat: "Taxe sur la valeur ajoutée algérienne",
    tvaAndTimbre: "TVA + timbre",
    items: "articles",
    units: "unités",
    lowStock: "Stock bas",
    high: "Élevé",
    low: "Faible",
    officialFacture: "Facture Officielle",
    internalBon: "Bon Interne",
    addProduct: "Ajouter un produit",
    subtotalHT: "Sous-total (HT)",
    taxTVA: "Taxe (TVA)",
    timbreFiscal: "Timbre Fiscal",
    totalAmountTTC: "Montant Total (TTC)",
    amountPaid: "Montant Payé",
    remainingDebt: "Reste à Payer",
    paymentMethod: "Méthode de Paiement",
    cash: "Espèces",
    credit: "Crédit",
    check: "Chèque",
    createInvoice: "Créer Facture",
    invoiceTitleDesc: "Créer une nouvelle facture avec prise en charge de la double facturation (Facture Officielle ou Bon Interne)",
    customer: "Client",
    date: "Date",
    statusPaid: "Payée",
    statusPartial: "Partielle",
    statusUnpaid: "Non payée",
    stockLevel: "Niveau de stock",
    minStockAlert: "Alerte stock minimum",
    supplier: "Fournisseur",
    totalRevenue: "Revenu Total",
    totalCollectedTVA: "TVA Totale Collectée",
    storeInformation: "Informations du magasin",
    legalNumbers: "Numéros légaux",
    commercialRegistry: "Registre de Commerce (RC)",
    fiscalId: "Identifiant Fiscal (NIF)",
    statisticalId: "Identifiant Statistique (NIS)",
    qty: "Qté",
    notes: "Notes",
    storeProfile: "Profil du Magasin",
    security: "Sécurité",
    storeName: "Nom du Magasin",
    storeLogo: "Logo du Magasin",
    inStock: "En stock",
    outOfStock: "Rupture de stock",
    newSupply: "Nouvel arrivage",
    profitMargin: "Marge bénéficiaire",
    currency: "Devise",
    currencyDefault: "DZD (د.ج)",
    emailNotifications: "Notifications par email",
    emailNotificationsDesc: "Recevez les résumés des ventes quotidiens par email.",
    posTitle: "Point de Vente (POS)",
    posDesc: "C'est ici que se trouvera votre interface de caisse. Vous pouvez scanner des produits, gérer les paniers et traiter les paiements.",
    retailMode: "Mode Détail",
    retailModeDesc: "Scan rapide et encaissement pour les clients de passage.",
    wholesaleMode: "Mode Gros",
    wholesaleModeDesc: "Commandes en gros et gestion de crédit pour les clients enregistrés.",
    salesManagement: "Gestion des Ventes",
    salesDesc: "Suivez vos revenus, analysez les tendances des ventes et gérez l'historique des transactions.",
    orders: "Commandes",
    avgOrderValue: "Valeur Moyenne des Commandes",
    financeTitle: "Finance et Comptabilité",
    financeDesc: "Gérez votre flux de trésorerie, vos dépenses, vos comptes bancaires et vos rapports financiers.",
    addExpense: "Ajouter une dépense",
    viewLedger: "Voir le grand livre",
    selectSupplier: "Sélectionner un Fournisseur",
    scanEnterBarcode: "Scanner ou Entrer le Code-barres",
    purchasePriceUnit: "Prix d'Achat / Unité",
    quantityReceived: "Quantité Reçue",
    expiryDateList: "Date d'Expiration (Optionnel)",
    totalOrderCost: "Coût Total de la Commande",
    savePurchaseOrder: "Confirmer et Enregistrer la Commande",
    searchProduct: "Rechercher un produit...",
    outOfStockWarning: "Attention : Stock Insuffisant !",
    discountDZD: "Remise (DZD)",
    applyTVA: "Appliquer la TVA",
    confirmSalePrint: "Confirmer la Vente et Imprimer",
    amountPaidCustomer: "Montant Payé par le Client",
    changeDue: "Rendu au Client (Monnaie)",
    productCategory: "Catégorie de Produit",
    minStockAlertQuantity: "Quantité d'Alerte Stock Minimum",
    skuAlreadyExists: "Erreur : SKU déjà enregistré pour un autre produit !",
    creatingProduct: "Enregistrement du produit...",
    maxCreditLimit: "Limite de Crédit Maximum",
    recordPayment: "Enregistrer un Paiement",
    currentTotalDebt: "Dette Totale Actuelle",
    amountToDeduct: "Montant à Déduire",
    fieldRequired: "Ce champ est obligatoire",
    positiveNumber: "Doit être un nombre positif",
    enterName: "Entrer le nom...",
    unknown: "Inconnu",
    received: "Reçue",
    draft: "Brouillon",
    noPurchases: "Aucun achat trouvé",
    backToPurchases: "Retour aux achats",
    recordNewPurchase: "Enregistrer un nouvel achat",
    purchaseFormDesc: "Ajoutez des articles à votre inventaire à partir d'un fournisseur",
    supplierInfo: "Informations sur le fournisseur",
    addItem: "Ajouter un article",
    product: "Produit",
    selectProduct: "Sélectionner un produit",
    paymentInfo: "Informations de paiement",
    cancel: "Annuler",
    backToSuppliers: "Retour aux fournisseurs",
    addNewSupplier: "Ajouter un nouveau fournisseur",
    supplierFormDesc: "Saisissez les détails du nouveau fournisseur",
    supplierName: "Nom du fournisseur",
    rc: "Registre de Commerce (RC)",
    paymentTerms: "Conditions de paiement",
    saveSupplier: "Enregistrer le fournisseur",
    noSuppliersFound: "Aucun fournisseur trouvé",
    noItemsAdded: "Aucun article ajouté pour le moment",
    // Detail pages
    back: "Retour",
    notFound: "Introuvable",
    customerNotFound: "Client introuvable",
    productNotFound: "Produit introuvable",
    active: "Actif",
    inactive: "Inactif",
    noSku: "—",
    description: "Description",
    costPrice: "Prix de revient",
    barcode: "Code-barres",
    // Finance
    totalIncome: "Total des revenus",
    totalExpenses: "Total des dépenses",
    recentTransactions: "Transactions récentes",
    viewAll: "Voir tout",
    category: "Catégorie",
    categoryPlaceholder: "Ex: Loyer, Salaires...",
    descriptionPlaceholder: "Description de la dépense...",
    save: "Enregistrer",
    ledgerTitle: "Grand Livre",
    reference: "Référence",
    income: "Entrée",
    expense: "Dépense",
    purchase: "Achat",
    invoice: "Facture",
    noLedgerEntries: "Aucune écriture comptable",
    // POS
    cart: "Panier",
    clear: "Vider",
    cartEmpty: "Panier vide",
    checkout: "Encaisser",
    selectCustomer: "Sélectionner un client",
    error: "Erreur",
    officialInvoice: "Facture officielle",
    totalToPay: "Total à payer",
    processing: "Traitement...",
    confirmPayment: "Confirmer le paiement",
    loading: "Chargement...",
    search: "Rechercher...",
    // Page descriptions
    overviewPageTitle: "Aperçu de la performance de votre boutique",
    overviewPageDesc: "Vue rapide sur les revenus, les bénéfices et les signaux qui demandent votre attention.",
    liveOperationsBoard: "Tableau d'exploitation en direct",
    upFromYesterday: "En hausse par rapport à hier",
    downFromYesterday: "En baisse par rapport à hier",
    recentSales: "Ventes récentes",
    topProducts: "Produits les plus vendus",
    noDataAvailableYet: "Aucune donnée disponible pour le moment",
    noSalesDataAvailableYet: "Aucune donnée de ventes pour le moment",
    auditLog: "Journal d'audit",
    allUsers: "Tous les utilisateurs",
    allEntities: "Toutes entités",
    allActions: "Toutes actions",
    details: "Détails",
    changes: "modifications",
    noLogs: "Aucun journal pour le moment",
    loadMore: "Charger plus",
    oldValue: "Ancienne valeur",
    newValue: "Nouvelle valeur",
    field: "Champ",
    customPermissions: "Permissions personnalisées",
    manageUsers: "Gérer les utilisateurs",
    role: "Rôle",
    lastLogin: "Dernière connexion",
    deactivate: "Désactiver",
    reactivate: "Réactiver",
    inviteUser: "Inviter un utilisateur",
    // Public / marketing
    heroKicker: "Retail et gros en une seule interface",
    heroTitle: "Un système d'exploitation plus précis pour les commerçants.",
    heroDesc: "Gérez produits, factures, clients, fournisseurs, caisse, finance et analytique depuis un espace de travail multi-tenant conçu pour la vitesse, la clarté et le support RTL.",
    heroCtaStart: "Commencer gratuitement",
    heroCtaOpenDashboard: "Ouvrir le tableau de bord",
    featureInventoryTitle: "Inventaire",
    featureInventoryDesc: "Signaux de stock clairs et contrôle des réapprovisionnements.",
    featureRevenueTitle: "Revenus",
    featureRevenueDesc: "Visibilité en temps réel des ventes et des marges.",
    featureTrustTitle: "Sécurité",
    featureTrustDesc: "Contrôles de rôle et séparation des locataires.",
    dashboardPreviewKicker: "Aperçu opérationnel",
    dashboardPreviewTitle: "Salama Control Center",
    dashboardPreviewLive: "En direct",
    dashboardPreviewRtlNote: "Conçu pour RTL, FR et EN dès le premier jour.",
    dashboardPreviewRtlSub: "Gardez le code simple, les interfaces claires et les flux de travail évidents.",
    dashboardPreviewMonthlyRevenue: "Revenu mensuel",
    dashboardPreviewOrdersToday: "Commandes aujourd'hui",
    dashboardPreviewLowStock: "Articles en stock faible",
    dashboardPreviewMargin: "Marge",
    // Sign-in
    signInKicker: "Bon retour",
    signInTitle: "Connexion à Salama ERP",
    signInDesc: "Accédez à votre tableau de bord, vos opérations et votre espace analytique.",
    // Sign-up
    signUpKicker: "Créer un compte",
    signUpTitle: "Démarrer avec Salama ERP",
    signUpDesc: "Configurez votre espace commerçant en quelques minutes.",
    // Auth layout feature cards
    authFeatureRetailTitle: "Retail + Gros",
    authFeatureRetailDesc: "Deux modes commerciaux, une seule interface.",
    authFeatureRtlTitle: "Prêt pour le RTL",
    authFeatureRtlDesc: "Mises en page arabes et navigation localisée.",
    authFeatureMtTitle: "Multi-locataire",
    authFeatureMtDesc: "Séparation claire avec accès basé sur les rôles.",
    authFeatureZeroTitle: "Zéro friction",
    authFeatureZeroDesc: "Flux simples pour un opérateur solo.",
  },
  ar: {
    dashboard: "لوحة التحكم",
    products: "المنتجات",
    customers: "الزبائن",
    invoices: "الفواتير",
    overview: "نظرة عامة",
    analytics: "التحليلات",
    pos: "نقطة البيع",
    sales: "المبيعات",
    suppliers: "الموردون",
    purchases: "المشتريات",
    finance: "المالية",
    settings: "الإعدادات",
    languageFrench: "Français",
    languageArabic: "العربية",
    createNew: "إضافة جديد",
    view: "عرض",
    backToCustomers: "العودة إلى الزبائن",
    backToProducts: "العودة إلى المنتجات",
    backToInvoices: "العودة إلى الفواتير",
    createCustomerTitle: "إضافة زبون جديد",
    createProductTitle: "إضافة منتج جديد",
    customerFormTitle: "معلومات الزبون",
    productFormTitle: "معلومات المنتج",
    customerName: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    address: "العنوان",
    creditLimit: "سقف الكريدي",
    productName: "اسم المنتج",
    skuBarcode: "SKU / الباركود",
    barcodeHint: "امسح الباركود أو أدخله بسرعة.",
    buyPrice: "سعر الشراء",
    sellPrice: "سعر البيع",
    initialStock: "المخزون الأولي",
    minStockLevel: "الحد الأدنى للمخزون",
    taxRate: "TVA",
    saveCustomer: "حفظ الزبون",
    saveProduct: "حفظ المنتج",
    saving: "جارٍ الحفظ...",
    searchCustomers: "ابحث بالاسم أو البريد أو الهاتف...",
    searchProducts: "ابحث بالاسم أو SKU أو الباركود...",
    searchInvoices: "ابحث برقم الفاتورة أو الزبون...",
    noCustomersFound: "لا يوجد زبائن",
    noProductsFound: "لا توجد منتجات",
    noInvoicesFound: "لا توجد فواتير",
    name: "الاسم",
    stock: "المخزون",
    totalDebt: "إجمالي الديون",
    settled: "مسدد",
    totalBalance: "الرصيد الإجمالي",
    actions: "الإجراءات",
    price: "السعر",
    invoiceNumber: "رقم الفاتورة",
    type: "النوع",
    amount: "المبلغ",
    paid: "المدفوع",
    debt: "الدَّين",
    status: "الحالة",
    official: "رسمية",
    informal: "غير رسمية",
    paidStatus: "مدفوعة",
    partialStatus: "جزئية",
    draftStatus: "مسودة",
    searchByNameOrSku: "ابحث بالاسم أو SKU...",
    searchByCustomer: "ابحث بالزبون...",
    searchByInvoice: "ابحث برقم الفاتورة...",
    stockAlerts: "تنبيهات المخزون",
    lowStockAlerts: "تنبيهات انخفاض المخزون",
    allProductsInStock: "جميع المنتجات متوفرة في المخزون",
    topDebtors: "أكبر المدينين",
    total: "الإجمالي",
    salesTrend: "اتجاه المبيعات",
    topSellingProducts: "أكثر المنتجات مبيعًا",
    noDataAvailable: "لا توجد بيانات لهذه الفترة",
    noSalesDataAvailable: "لا توجد بيانات مبيعات",
    today: "اليوم",
    last7Days: "آخر 7 أيام",
    thisMonth: "هذا الشهر",
    analyticsDashboard: "لوحة تحكم التحليلات",
    monitorBusinessPerformance: "راقب أداء النشاط والمؤشرات الأساسية",
    totalSales: "إجمالي المبيعات",
    netProfit: "صافي الربح",
    outstandingDebt: "الديون المستحقة",
    lowStockItems: "العناصر منخفضة المخزون",
    totalTVACollected: "إجمالي TVA المحصل",
    taxLiability: "الالتزام الضريبي",
    averageProfitMargin: "متوسط هامش الربح",
    averageTransactionValue: "متوسط قيمة العملية",
    creditUtilization: "استخدام الائتمان",
    summary: "الملخص",
    afterCostOfGoods: "بعد تكلفة البضاعة",
    fromCustomers: "من الزبائن",
    belowMinimumLevel: "أقل من الحد الأدنى",
    algerianVat: "ضريبة القيمة المضافة الجزائرية",
    tvaAndTimbre: "TVA + الطابع",
    items: "عناصر",
    units: "وحدات",
    lowStock: "مخزون منخفض",
    high: "مرتفع",
    low: "منخفض",
    officialFacture: "فاتورة رسمية",
    internalBon: "وصل داخلي",
    addProduct: "إضافة منتج",
    subtotalHT: "المجموع الصافي (HT)",
    taxTVA: "الضريبة (TVA)",
    timbreFiscal: "حق الطابع الجبائي",
    totalAmountTTC: "المبلغ الإجمالي (TTC)",
    amountPaid: "المبلغ المدفوع",
    remainingDebt: "المبلغ المتبقي (الكريدي)",
    paymentMethod: "طريقة الدفع",
    cash: "نقداً",
    credit: "على الحساب (كريدي)",
    check: "صك بنكي",
    createInvoice: "إنشاء فاتورة",
    invoiceTitleDesc: "إضافة فاتورة جديدة (فاتورة رسمية أو وصل داخلي)",
    customer: "الزبون",
    date: "التاريخ",
    statusPaid: "مدفوعة",
    statusPartial: "مدفوعة جزئياً",
    statusUnpaid: "غير مدفوعة",
    stockLevel: "حالة المخزون",
    minStockAlert: "تنبيه الحد الأدنى للمخزون",
    supplier: "المورد (Fournisseur)",
    totalRevenue: "إجمالي المداخيل",
    totalCollectedTVA: "إجمالي ضريبة TVA المحصلة",
    storeInformation: "معلومات المتجر",
    legalNumbers: "الأرقام القانونية للمؤسسة",
    commercialRegistry: "السجل التجاري (RC)",
    fiscalId: "الرقم الجبائي (NIF)",
    statisticalId: "رقم التعريف الإحصائي (NIS)",
    qty: "الكمية",
    notes: "ملاحظات",
    storeProfile: "ملف المتجر",
    security: "الأمان",
    storeName: "اسم المتجر",
    storeLogo: "شعار المتجر",
    inStock: "متوفر",
    outOfStock: "نفذ المخزون",
    newSupply: "توريد جديد",
    profitMargin: "هامش الربح",
    currency: "العملة",
    currencyDefault: "د.ج (DZD)",
    emailNotifications: "إشعارات البريد الإلكتروني",
    emailNotificationsDesc: "استلام ملخص المبيعات اليومي عبر البريد الإلكتروني.",
    posTitle: "نقطة البيع",
    posDesc: "هنا ستكون واجهة الدفع لمبيعات التجزئة. يمكنك مسح المنتجات وإدارة العربات ومعالجة المدفوعات.",
    retailMode: "وضع التجزئة",
    retailModeDesc: "مسح سريع ودفع للزبائن العابرين.",
    wholesaleMode: "وضع الجملة",
    wholesaleModeDesc: "طلبات الجملة وإدارة الائتمان للعملاء المسجلين.",
    salesManagement: "إدارة المبيعات",
    salesDesc: "تتبع إيراداتك، حلل اتجاهات المبيعات، وأدر المعاملات السابقة.",
    orders: "الطلبات",
    avgOrderValue: "متوسط قيمة الطلب",
    financeTitle: "المالية والمحاسبة",
    financeDesc: "إدارة التدفق النقدي، المصروفات، الحسابات البنكية، والتقارير المالية.",
    addExpense: "إضافة مصروف",
    viewLedger: "عرض السجل المحاسبي",
    selectSupplier: "اختر المورد",
    scanEnterBarcode: "امسح الباركود أو أدخل الرمز",
    purchasePriceUnit: "سعر الشراء للوحدة",
    quantityReceived: "الكمية المستلمة",
    expiryDateList: "تاريخ انتهاء الصلاحية (اختياري)",
    totalOrderCost: "التكلفة الإجمالية للطلبية",
    savePurchaseOrder: "تأكيد وتسجيل فاتورة المشتريات",
    searchProduct: "ابحث عن منتج...",
    outOfStockWarning: "تنبيه: المخزون غير كافي!",
    discountDZD: "تخفيض (د.ج)",
    applyTVA: "تطبيق الضريبة (TVA)",
    confirmSalePrint: "تأكيد البيع وطباعة",
    amountPaidCustomer: "المبلغ المستلم من الزبون",
    changeDue: "المبلغ المتبقي للزبون (الصرف)",
    productCategory: "فئة المنتج / الصنف",
    minStockAlertQuantity: "تنبهني عندما تصل الكمية إلى...",
    skuAlreadyExists: "خطأ: رمز الباركود هذا مسجل لمنتج آخر!",
    creatingProduct: "جاري حفظ المنتج...",
    maxCreditLimit: "الحد الأقصى للكريدي المسموح به",
    recordPayment: "تسجيل دفعة ماليّة (تسديد)",
    currentTotalDebt: "إجمالي الدين الحالي",
    amountToDeduct: "المبلغ المراد خصمه من الدين",
    fieldRequired: "هذا الحقل إجباري",
    positiveNumber: "يجب أن يكون الرقم أكبر من الصفر",
    enterName: "أدخل الاسم...",
    unknown: "غير معروف",
    received: "مستلمة",
    draft: "مسودة",
    noPurchases: "لم يتم العثور على أي مشتريات",
    backToPurchases: "العودة إلى المشتريات",
    recordNewPurchase: "تسجيل عملية شراء جديدة",
    purchaseFormDesc: "إضافة سلع إلى المخزون الخاص بك من مورد",
    supplierInfo: "معلومات المورد",
    addItem: "إضافة عنصر",
    product: "المنتج",
    selectProduct: "اختر المنتج",
    paymentInfo: "معلومات الدفع",
    cancel: "إلغاء",
    backToSuppliers: "العودة إلى الموردين",
    addNewSupplier: "إضافة مورد جديد",
    supplierFormDesc: "أدخل تفاصيل المورد الجديد",
    supplierName: "اسم المورد",
    rc: "السجل التجاري (RC)",
    paymentTerms: "شروط الدفع",
    saveSupplier: "حفظ المورد",
    noSuppliersFound: "لم يتم العثور على أي مورد",
    noItemsAdded: "لم يتم إضافة أي عناصر بعد",
    // Detail pages
    back: "رجوع",
    notFound: "غير موجود",
    customerNotFound: "الزبون غير موجود",
    productNotFound: "المنتج غير موجود",
    active: "نشط",
    inactive: "غير نشط",
    noSku: "—",
    description: "الوصف",
    costPrice: "سعر التكلفة",
    barcode: "الباركود",
    // Finance
    totalIncome: "إجمالي الدخل",
    totalExpenses: "إجمالي المصروفات",
    recentTransactions: "آخر المعاملات",
    viewAll: "عرض الكل",
    category: "الفئة",
    categoryPlaceholder: "مثل: إيجار، رواتب...",
    descriptionPlaceholder: "وصف المصروف...",
    save: "حفظ",
    ledgerTitle: "دفتر الأستاذ",
    reference: "المرجع",
    income: "دخل",
    expense: "مصروف",
    purchase: "شراء",
    invoice: "فاتورة",
    noLedgerEntries: "لا توجد قيود محاسبية",
    // POS
    cart: "السلة",
    clear: "تفريغ",
    cartEmpty: "السلة فارغة",
    checkout: "الدفع",
    selectCustomer: "اختر زبوناً",
    error: "خطأ",
    officialInvoice: "فاتورة رسمية",
    totalToPay: "المبلغ الإجمالي",
    processing: "جارٍ المعالجة...",
    confirmPayment: "تأكيد الدفع",
    loading: "جارٍ التحميل...",
    search: "بحث...",
    // Page descriptions
    overviewPageTitle: "ملخص أداء متجرك",
    overviewPageDesc: "رؤية سريعة للمبيعات، الأرباح، والتنبيهات المهمة.",
    liveOperationsBoard: "لوحة تشغيل حية",
    upFromYesterday: "ارتفاع عن الأمس",
    downFromYesterday: "انخفاض عن الأمس",
    recentSales: "أحدث المبيعات",
    topProducts: "المنتجات الأكثر مبيعاً",
    noDataAvailableYet: "لا توجد بيانات متاحة حتى الآن",
    noSalesDataAvailableYet: "لا توجد مبيعات حتى الآن",
    auditLog: "سجل التدقيق",
    allUsers: "كل المستخدمين",
    allEntities: "كل الكيانات",
    allActions: "كل الإجراءات",
    details: "التفاصيل",
    changes: "تغييرات",
    noLogs: "لا توجد سجلات حالياً",
    loadMore: "تحميل المزيد",
    oldValue: "القيمة السابقة",
    newValue: "القيمة الجديدة",
    field: "الحقل",
    customPermissions: "صلاحيات مخصصة",
    manageUsers: "إدارة المستخدمين",
    role: "الدور",
    lastLogin: "آخر دخول",
    deactivate: "تعطيل",
    reactivate: "تنشيط",
    inviteUser: "دعوة مستخدم",
    // Public / marketing
    heroKicker: "تجزئة وجملة في مكان واحد",
    heroTitle: "نظام تشغيل أكثر حدة للتجار.",
    heroDesc: "أدر المنتجات والفواتير والزبائن والموردين والمبيعات والمالية والتحليلات من مساحة عمل متعددة المستأجرين مبنية للسرعة والوضوح ودعم RTL.",
    heroCtaStart: "ابدأ مجاناً",
    heroCtaOpenDashboard: "فتح لوحة التحكم",
    featureInventoryTitle: "المخزون",
    featureInventoryDesc: "إشارات مخزون واضحة والتحكم في إعادة الطلب.",
    featureRevenueTitle: "المداخيل",
    featureRevenueDesc: "رؤية مباشرة للمبيعات والهوامش.",
    featureTrustTitle: "الأمان",
    featureTrustDesc: "حماية الأدوار وفصل المستأجرين.",
    dashboardPreviewKicker: "لقطة تشغيلية",
    dashboardPreviewTitle: "مركز التحكم Salama",
    dashboardPreviewLive: "مباشر",
    dashboardPreviewRtlNote: "مُصمم لـ RTL، FR، وEN منذ البداية.",
    dashboardPreviewRtlSub: "احتفظ بالكود صغيراً والواجهات هادئة وسير العمل اليومي واضحاً.",
    dashboardPreviewMonthlyRevenue: "الإيراد الشهري",
    dashboardPreviewOrdersToday: "الطلبات اليوم",
    dashboardPreviewLowStock: "منتجات المخزون المنخفض",
    dashboardPreviewMargin: "الهامش",
    // Sign-in
    signInKicker: "مرحباً بعودتك",
    signInTitle: "تسجيل الدخول إلى Salama ERP",
    signInDesc: "انتقل إلى لوحة التحكم والعمليات ومساحة التحليلات الخاصة بك.",
    // Sign-up
    signUpKicker: "إنشاء حساب",
    signUpTitle: "ابدأ مع Salama ERP",
    signUpDesc: "أعدّ مساحة عملك كتاجر في دقائق.",
    // Auth layout feature cards
    authFeatureRetailTitle: "تجزئة + جملة",
    authFeatureRetailDesc: "وضعان تجاريان، واجهة واحدة.",
    authFeatureRtlTitle: "جاهز للـ RTL",
    authFeatureRtlDesc: "تخطيطات عربية وتنقل محلي.",
    authFeatureMtTitle: "متعدد المستأجرين",
    authFeatureMtDesc: "فصل واضح مع وصول يراعي الأدوار.",
    authFeatureZeroTitle: "صفر احتكاك",
    authFeatureZeroDesc: "تدفقات بسيطة لمشغل المتجر الفردي.",
  },
  en: {
    dashboard: "Dashboard",
    products: "Products",
    customers: "Customers",
    invoices: "Invoices",
    suppliers: "Suppliers",
    overview: "Overview",
    analytics: "Analytics",
    pos: "POS",
    sales: "Sales",
    purchases: "Purchases",
    finance: "Finance",
    settings: "Settings",
    languageFrench: "French",
    languageArabic: "Arabic",
    createNew: "Create",
    view: "View",
    backToCustomers: "Back to customers",
    backToProducts: "Back to products",
    backToInvoices: "Back to invoices",
    createCustomerTitle: "Create a new customer",
    createProductTitle: "Create a new product",
    customerFormTitle: "Customer information",
    productFormTitle: "Product information",
    customerName: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    creditLimit: "Credit limit",
    productName: "Product name",
    skuBarcode: "SKU / Barcode",
    barcodeHint: "Scan the barcode or enter it quickly.",
    buyPrice: "Purchase price",
    sellPrice: "Sale price",
    initialStock: "Initial stock",
    minStockLevel: "Minimum stock level",
    taxRate: "VAT",
    saveCustomer: "Save customer",
    saveProduct: "Save product",
    saving: "Saving...",
    noCustomersFound: "No customers found",
    noProductsFound: "No products found",
    noInvoicesFound: "No invoices found",
    name: "Name",
    stock: "Stock",
    totalDebt: "Total debt",
    settled: "Settled",
    totalBalance: "Total balance",
    price: "Price",
    invoiceNumber: "Invoice no.",
    type: "Type",
    amount: "Amount",
    paid: "Paid",
    debt: "Debt",
    status: "Status",
    official: "Official",
    informal: "Informal",
    paidStatus: "Paid",
    partialStatus: "Partial",
    draftStatus: "Draft",
    searchByNameOrSku: "Search by name or SKU...",
    searchByCustomer: "Search by customer...",
    searchByInvoice: "Search by invoice number...",
    noDataAvailable: "No data available for this period",
    noSalesDataAvailable: "No sales data available",
    today: "Today",
    last7Days: "Last 7 days",
    thisMonth: "This month",
    salesTrend: "Sales trend",
    topSellingProducts: "Top-selling products",
    afterCostOfGoods: "After cost of goods sold",
    fromCustomers: "from",
    belowMinimumLevel: "Below minimum level",
    algerianVat: "Algerian VAT",
    tvaAndTimbre: "VAT and fiscal stamp",
    items: "items",
    units: "units",
    lowStock: "Low stock",
    high: "High",
    low: "Low",
    officialFacture: "Official invoice",
    internalBon: "Internal slip",
    subtotalHT: "Subtotal (excl. tax)",
    taxTVA: "VAT",
    timbreFiscal: "Fiscal stamp",
    totalAmountTTC: "Total amount (incl. tax)",
    amountPaid: "Amount paid",
    remainingDebt: "Remaining debt",
    createInvoice: "Create invoice",
    invoiceTitleDesc: "Create a new invoice with support for dual billing (official invoice or internal slip)",
    customer: "Customer",
    date: "Date",
    statusPaid: "Paid",
    statusPartial: "Partial",
    statusUnpaid: "Unpaid",
    stockLevel: "Stock level",
    minStockAlert: "Minimum stock alert",
    totalCollectedTVA: "Total VAT collected",
    storeInformation: "Store information",
    legalNumbers: "Legal numbers",
    commercialRegistry: "Commercial register (RC)",
    fiscalId: "Tax ID (NIF)",
    statisticalId: "Statistical ID (NIS)",
    qty: "Qty",
    notes: "Notes",
    inStock: "In stock",
    outOfStock: "Out of stock",
    newSupply: "New stock arrival",
    profitMargin: "Profit margin",
    officialInvoice: "Official invoice",
    totalToPay: "Total to pay",
    selectCustomer: "Select customer",
    error: "Error",
    searchInvoices: "Search by invoice number or customer...",
    searchProducts: "Search by name, SKU, or barcode...",
    searchCustomers: "Search by name, email, or phone...",
    stockAlerts: "Stock alerts",
    lowStockAlerts: "Low stock alerts",
    allProductsInStock: "All products are in stock",
    topDebtors: "Top debtors",
    totalSales: "Total sales",
    netProfit: "Net profit",
    outstandingDebt: "Outstanding debt",
    lowStockItems: "Low stock items",
    totalTVACollected: "Total VAT collected",
    taxLiability: "Tax liability",
    averageProfitMargin: "Average profit margin",
    averageTransactionValue: "Average transaction value",
    creditUtilization: "Credit utilization",
    summary: "Summary",
    totalRevenue: "Total revenue",
    storeProfile: "Store profile",
    security: "Security",
    storeName: "Store name",
    currency: "Currency",
    currencyDefault: "Algerian Dinar (DZD)",
    emailNotifications: "Email notifications",
    emailNotificationsDesc: "Receive activity summaries and alerts by email.",
    posTitle: "Point of Sale",
    posDesc: "Fast checkout for retail and wholesale counters.",
    retailMode: "Retail mode",
    retailModeDesc: "Fast scanning and checkout for walk-in customers.",
    wholesaleMode: "Wholesale mode",
    wholesaleModeDesc: "Bulk orders and credit management for registered customers.",
    salesManagement: "Sales management",
    salesDesc: "Track your revenue, analyze sales trends, and manage transaction history.",
    financeTitle: "Finance",
    financeDesc: "Track cash flow, expenses, and ledgers.",
    addExpense: "Add expense",
    viewLedger: "View ledger",
    cart: "Cart",
    clear: "Clear",
    cartEmpty: "Your cart is empty",
    checkout: "Checkout",
    loading: "Loading...",
    processing: "Processing...",
    confirmPayment: "Confirm payment",
    search: "Search...",
    // Payment methods
    cash: "Cash",
    credit: "Credit",
    check: "Cheque",
    // Page descriptions
    overviewPageTitle: "Your store at a glance",
    overviewPageDesc: "Fast visibility into revenue, profit, and the signals that need attention.",
    liveOperationsBoard: "Live operations board",
    upFromYesterday: "up from yesterday",
    downFromYesterday: "down from yesterday",
    recentSales: "Recent sales",
    topProducts: "Top products",
    noDataAvailableYet: "No data available yet",
    noSalesDataAvailableYet: "No sales data available yet",
    auditLog: "Audit log",
    allUsers: "All users",
    allEntities: "All entities",
    allActions: "All actions",
    details: "Details",
    changes: "changes",
    noLogs: "No logs for the moment",
    loadMore: "Load more",
    oldValue: "Old value",
    newValue: "New value",
    field: "Field",
    customPermissions: "Custom permissions",
    manageUsers: "Manage users",
    role: "Role",
    lastLogin: "Last login",
    deactivate: "Deactivate",
    reactivate: "Reactivate",
    inviteUser: "Invite user",
    // Public / marketing
    heroKicker: "Retail and wholesale in one shell",
    heroTitle: "A sharper operating system for merchants.",
    heroDesc: "Run products, invoices, customers, suppliers, POS, finance, and analytics from one polished multi-tenant workspace built for speed, clarity, and RTL support.",
    heroCtaStart: "Start free",
    heroCtaOpenDashboard: "Open dashboard",
    featureInventoryTitle: "Inventory",
    featureInventoryDesc: "Clear stock signals and reorder control.",
    featureRevenueTitle: "Revenue",
    featureRevenueDesc: "Live sales and margin visibility.",
    featureTrustTitle: "Trust",
    featureTrustDesc: "Role gates and tenant separation.",
    dashboardPreviewKicker: "Operations snapshot",
    dashboardPreviewTitle: "Salama Control Center",
    dashboardPreviewLive: "Live",
    dashboardPreviewRtlNote: "Designed for RTL, FR, and EN from day one.",
    dashboardPreviewRtlSub: "Keep the code small, the surfaces calm, and the daily workflows obvious.",
    dashboardPreviewMonthlyRevenue: "Monthly revenue",
    dashboardPreviewOrdersToday: "Orders today",
    dashboardPreviewLowStock: "Low stock items",
    dashboardPreviewMargin: "Margin",
    // Sign-in
    signInKicker: "Welcome back",
    signInTitle: "Sign in to Salama ERP",
    signInDesc: "Continue to your dashboard, operations, and analytics workspace.",
    // Sign-up
    signUpKicker: "Create account",
    signUpTitle: "Start using Salama ERP",
    signUpDesc: "Set up your merchant workspace in minutes.",
    // Auth layout feature cards
    authFeatureRetailTitle: "Retail + wholesale",
    authFeatureRetailDesc: "Two commercial modes, one interface.",
    authFeatureRtlTitle: "RTL ready",
    authFeatureRtlDesc: "Arabic layouts and localized navigation.",
    authFeatureMtTitle: "Multi-tenant",
    authFeatureMtDesc: "Clear separation with role-aware access.",
    authFeatureZeroTitle: "Zero-friction",
    authFeatureZeroDesc: "Simple flows for a solo operator.",
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  dir: "ltr" | "rtl";
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = LANGUAGE_COOKIE_KEY;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (storedLanguage === "ar" || storedLanguage === "fr" || storedLanguage === "en") {
      setLanguageState(storedLanguage);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === "ar" ? "ar" : language === "en" ? "en" : "fr";
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.cookie = `${LANGUAGE_COOKIE_KEY}=${language}; path=/; max-age=31536000; samesite=lax`;
  }, [language]);

  // Fallback chain: active language → English (neutral fallback) → raw key
  // We intentionally do NOT fall back to French so EN/AR never show French text.
  const t = (key: TranslationKey): string =>
    translations[language][key] ??
    (language !== "en" ? translations.en[key] : undefined) ??
    key;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: setLanguageState,
        dir: language === "ar" ? "rtl" : "ltr",
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used within a LanguageProvider");
  }

  return context;
}