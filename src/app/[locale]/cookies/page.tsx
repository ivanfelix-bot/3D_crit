import type { Metadata } from "next";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cookieSections, LEGAL_UPDATED } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/site/LegalPage";

export async function generateMetadata({ params }: PageProps<"/[locale]/cookies">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return pageMetadata({ locale: locale as Locale, path: "/cookies", title: t.legal.cookieTitle, description: t.legal.cookieTitle });
}

export default async function CookiesPage({ params }: PageProps<"/[locale]/cookies">) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return <LegalPage title={t.legal.cookieTitle} updatedLabel={t.legal.updated} updated={LEGAL_UPDATED} sections={cookieSections(locale as Locale)} />;
}
