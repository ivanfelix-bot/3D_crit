import { requireAdmin } from "@/lib/auth";
import type { Category } from "@/lib/types";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteCategory } from "../../actions";

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, { data: counts }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name_it"),
    supabase.from("products").select("category_id"),
  ]);
  const categories = (data ?? []) as Category[];
  const countBy = new Map<string, number>();
  (counts ?? []).forEach((r) => r.category_id && countBy.set(r.category_id, (countBy.get(r.category_id) ?? 0) + 1));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categorie</h1>

      <section className="card p-5">
        <h2 className="mb-4 font-semibold">Nuova categoria</h2>
        <CategoryForm />
      </section>

      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="card p-4">
            <details>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="font-medium">{c.name_it}</span>
                  <span className="text-sm text-muted"> / {c.name_en}</span>
                </span>
                <span className="text-xs text-muted">{countBy.get(c.id) ?? 0} prodotti · modifica</span>
              </summary>
              <div className="mt-4 border-t border-line pt-4">
                <CategoryForm category={c} />
                <div className="mt-3">
                  <ConfirmButton
                    action={deleteCategory.bind(null, c.id)}
                    confirm={`Eliminare la categoria "${c.name_it}"? I prodotti resteranno senza categoria.`}
                    className="btn-ghost min-h-9 text-xs text-bad"
                  >
                    Elimina categoria
                  </ConfirmButton>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
