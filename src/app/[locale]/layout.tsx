import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist } from "next/font/google";
import "../globals.css";
import { BRAND_NAME, getSiteUrl } from "@/lib/config";
import { getDictionary, isLocale, LOCALES } from "@/lib/i18n";
import { getSettings } from "@/lib/data";
import { getPaymentsState } from "@/lib/payments/config";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });

// Le pagine pubbliche vengono generate in anticipo e aggiornate ogni 5 minuti
// (oppure subito quando salvi qualcosa dall'admin).
export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: t.meta.title, template: `%s | ${BRAND_NAME}` },
    description: t.meta.description,
    applicationName: BRAND_NAME,
  };
}

export const viewport: Viewport = {
  themeColor: "#f8f5ef",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const [settings, payments] = await Promise.all([getSettings(), getPaymentsState()]);

  return (
    <html lang={locale} className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-paper focus:px-4 focus:py-2">
          Skip
        </a>
        <Header locale={locale} t={t} showCart={payments.enabled} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} t={t} email={settings?.contact_email} tiktok={settings?.tiktok_url} />
      </body>
    </html>
  );
}
