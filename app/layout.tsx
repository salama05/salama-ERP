import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Tajawal, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { FALLBACK_LANGUAGE, LANGUAGE_COOKIE_KEY, type Language } from "@/lib/i18n";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Salama ERP",
    template: "%s | Salama ERP",
  },
  description: "Multi-tenant retail and wholesale SaaS for modern merchants - Salama ERP.",
  metadataBase: new URL("https://salamaerp.com"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const storedLanguage = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;
  const language: Language =
    storedLanguage === "ar" || storedLanguage === "en" || storedLanguage === "fr"
      ? storedLanguage
      : FALLBACK_LANGUAGE;
  const dir = language === "ar" ? "rtl" : "ltr";
  const isDemoSession = cookieStore.get("demo_session")?.value === "active";

  return (
    <html
      lang={language}
      dir={dir}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${tajawal.variable} ${ibmPlexArabic.variable} ${inter.variable} h-full antialiased bg-[var(--color-bg-base)]`}
    >
      {/* Added for Salama ERP specific styling or meta. Not part of the original diff, but good for future customization. */}
      <body className="min-h-full flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
        <ConvexClientProvider initialDemo={isDemoSession}>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
