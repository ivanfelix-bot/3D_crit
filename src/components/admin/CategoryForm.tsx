"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveCategory } from "@/app/admin/actions";
import type { Category } from "@/lib/types";

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState(saveCategory, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && !category) formRef.current?.reset();
  }, [state, category]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end">
      {category && <input type="hidden" name="id" value={category.id} />}
      <label className="block">
        <span className="label">Nome (italiano)</span>
        <input name="name_it" required maxLength={80} defaultValue={category?.name_it} className="input" />
      </label>
      <label className="block">
        <span className="label">Nome (inglese)</span>
        <input name="name_en" maxLength={80} defaultValue={category?.name_en} className="input" />
      </label>
      <label className="block">
        <span className="label">Ordine</span>
        <input name="sort_order" type="number" defaultValue={category?.sort_order ?? 100} className="input" />
      </label>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Salvo…" : category ? "Salva" : "Aggiungi"}
      </button>
      {state?.error && <p className="text-sm text-bad sm:col-span-4">{state.error}</p>}
      {state?.ok && <p className="text-sm text-ok sm:col-span-4">Salvato ✓</p>}
    </form>
  );
}
