import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { getDictionary, type Locale } from "@/lib/i18n";
import { LEGAL_UPDATED, privacySections } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/site/LegalPage";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return pageMetadata({ locale: locale as Locale, path: "/privacy", title: t.legal.privacyTitle, description: t.legal.privacyTitle });
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const settings = await getSettings();
  return (
    <LegalPage
      title={t.legal.privacyTitle}
      updatedLabel={t.legal.updated}
      updated={LEGAL_UPDATED}
      sections={privacySections(locale as Locale, settings?.contact_email ?? "")}
    />
  );
}
