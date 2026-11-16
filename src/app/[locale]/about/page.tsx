import type { Metadata } from "next";
import { getDictionary, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site/PageHeader";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return pageMetadata({ locale: locale as Locale, path: "/about", title: t.about.title, description: t.about.paragraphs[0] });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <div className="container-site max-w-3xl">
      <PageHeader title={t.about.title} />
      <div className="prose-site text-lg">
        {t.about.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}
