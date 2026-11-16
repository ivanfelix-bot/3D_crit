import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { Category, ProductWithImages } from "@/lib/types";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*, product_images(*), categories(id, slug, name_it, name_en)").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);
  if (!product) notFound();
  const p = product as unknown as ProductWithImages;

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-muted hover:text-ink">← Prodotti</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{p.name_it}</h1>
        {p.published && (
          <Link href={`/it/products/${p.slug}`} target="_blank" className="text-sm text-muted underline hover:text-ink">
            Vedi sul sito ↗
          </Link>
        )}
      </div>
      <ProductForm product={p} categories={(categories ?? []) as Category[]} />
    </div>
  );
}
