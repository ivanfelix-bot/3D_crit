import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { ProductWithImages } from "@/lib/types";
import { ProductRow } from "@/components/admin/ProductRow";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), categories(id, slug, name_it, name_en)")
    .order("sort_order")
    .order("created_at", { ascending: false });
  const products = (data ?? []) as unknown as ProductWithImages[];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Prodotti</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + Nuovo prodotto
        </Link>
      </div>
      {error && <p className="mt-4 text-sm text-bad">{error.message}</p>}
      {products.length === 0 ? (
        <p className="card mt-6 p-10 text-center text-muted">Nessun prodotto. Aggiungi il primo!</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {products.map((p) => (
            <ProductRow
              key={p.id}
              product={{
                id: p.id,
                name: p.name_it,
                price_cents: p.price_cents,
                status: p.status,
                stock: p.stock,
                featured: p.featured,
                published: p.published,
                is_demo: p.is_demo,
                category: p.categories?.name_it ?? null,
                cover: [...p.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null,
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
