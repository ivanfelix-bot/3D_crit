import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Category } from "@/lib/types";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-muted hover:text-ink">← Prodotti</Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold">Nuovo prodotto</h1>
      <ProductForm categories={(data ?? []) as Category[]} />
    </div>
  );
}
