import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { getDictionary, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";
import { PageHeader } from "@/components/site/PageHeader";

export async function generateMetadata({ params }: PageProps<"/[locale]/products">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return pageMetadata({ locale: locale as Locale, path: "/products", title: t.catalog.title, description: t.catalog.subtitle + " " + t.meta.description });
}

export default async function CatalogPage({ params }: PageProps<"/[locale]/products">) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="container-site">
      <PageHeader title={t.catalog.title} subtitle={t.catalog.subtitle} />
      <Suspense>
        <CatalogBrowser products={products} categories={categories} locale={locale} t={t} />
      </Suspense>
    </div>
  );
}
