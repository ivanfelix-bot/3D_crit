import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { getDictionary, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site/PageHeader";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return pageMetadata({ locale: locale as Locale, path: "/contact", title: t.contact.title, description: t.contact.text });
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const settings = await getSettings();
  const email = settings?.contact_email;
  const tiktok = settings?.tiktok_url;
  const tiktokHandle = tiktok ? tiktok.replace(/^https?:\/\/(www\.)?tiktok\.com\//, "").replace(/\/$/, "") : "";

  return (
    <div className="container-site max-w-3xl">
      <PageHeader title={t.contact.title} subtitle={t.contact.text} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-sm text-muted">{t.contact.email}</h2>
          {email ? (
            <a href={`mailto:${email}`} className="mt-2 block break-all text-lg font-medium hover:underline">
              {email}
            </a>
          ) : (
            <p className="mt-2 text-lg text-muted">{t.contact.notSet}</p>
          )}
        </div>
        <div className="card p-6">
          <h2 className="text-sm text-muted">{t.contact.tiktok}</h2>
          {tiktok ? (
            <a href={tiktok} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-lg font-medium hover:underline">
              {tiktokHandle || "TikTok"}
            </a>
          ) : (
            <p className="mt-2 text-lg text-muted">{t.contact.notSet}</p>
          )}
        </div>
      </div>
    </div>
  );
}
