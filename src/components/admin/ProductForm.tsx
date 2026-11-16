"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProduct, deleteProduct, type ProductInput } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { resizeImage } from "@/lib/image-resize";
import { IMAGES_BUCKET, MARKETPLACES, MARKETPLACE_LABELS } from "@/lib/config";
import { STATUS_LABELS } from "@/lib/labels";
import { PRODUCT_STATUSES, type Category, type ProductStatus, type ProductWithImages } from "@/lib/types";
import { ProductPhoto } from "@/components/site/ProductPhoto";
import { ConfirmButton } from "./ConfirmButton";

interface FormImage {
  key: string;
  url: string; // URL pubblico oppure anteprima locale (blob:) per le foto non ancora caricate
  storage_path: string | null;
  alt: string;
  file?: File;
}

/** Modulo di creazione/modifica prodotto, pensato anche per l'uso da telefono. */
export function ProductForm({ product, categories }: { product?: ProductWithImages; categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<FormImage[]>(
    (product?.product_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ key: i.id, url: i.url, storage_path: i.storage_path, alt: i.alt })),
  );

  const [f, setF] = useState({
    name_it: product?.name_it ?? "",
    name_en: product?.name_en ?? "",
    description_it: product?.description_it ?? "",
    description_en: product?.description_en ?? "",
    price: product ? (product.price_cents / 100).toFixed(2).replace(".", ",") : "",
    material: product?.material ?? "PLA",
    dimensions: product?.dimensions ?? "",
    status: (product?.status ?? "available") as ProductStatus,
    stock: product?.stock ?? 1,
    featured: product?.featured ?? false,
    published: product?.published ?? true,
    category_id: product?.category_id ?? "",
    vinted_url: product?.vinted_url ?? "",
    ebay_url: product?.ebay_url ?? "",
    amazon_url: product?.amazon_url ?? "",
    wallapop_url: product?.wallapop_url ?? "",
  });
  const set = <K extends keyof typeof f>(key: K, value: (typeof f)[K]) => {
    setSaved(false);
    setF((prev) => ({ ...prev, [key]: value }));
  };

  function addFiles(files: FileList | null) {
    if (!files) return;
    const added = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        key: `${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(file),
        storage_path: null,
        alt: "",
        file,
      }));
    setImages((prev) => [...prev, ...added]);
    setSaved(false);
  }

  function move(index: number, delta: number) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSaved(false);
  }

  /** Carica su Supabase Storage le foto nuove (ridimensionate) e restituisce la lista finale. */
  async function uploadPending(): Promise<ProductInput["images"]> {
    const supabase = createSupabaseBrowserClient();
    const result: ProductInput["images"] = [];
    for (const img of images) {
      if (!img.file) {
        result.push({ url: img.url, storage_path: img.storage_path, alt: img.alt });
        continue;
      }
      const blob = await resizeImage(img.file);
      const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
      const path = `products/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(IMAGES_BUCKET)
        .upload(path, blob, { contentType: blob.type || "image/jpeg", cacheControl: "31536000", upsert: false });
      if (upErr) throw new Error(`Upload foto non riuscito: ${upErr.message}`);
      const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
      result.push({ url: data.publicUrl, storage_path: path, alt: img.alt });
    }
    return result;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        setUploading(true);
        const uploaded = await uploadPending();
        setUploading(false);
        const res = await saveProduct({ ...f, id: product?.id, slug: product?.slug, stock: Number(f.stock), images: uploaded });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setImages(uploaded.map((u, i) => ({ key: `${u.url}-${i}`, ...u })));
        setSaved(true);
        if (!product) router.replace(`/admin/products/${res.id}`);
        else router.refresh();
      } catch (err) {
        setUploading(false);
        setError(err instanceof Error ? err.message : "Errore imprevisto");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24">
      {/* FOTO */}
      <section className="card p-5">
        <h2 className="font-semibold">Foto</h2>
        <p className="mt-1 text-xs text-muted">La prima foto è la copertina. Le foto vengono ridimensionate automaticamente.</p>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((img, i) => (
            <div key={img.key} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-cream">
                {img.file ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ProductPhoto src={img.url} alt="" sizes="160px" />
                )}
                {i === 0 && <span className="absolute left-1 top-1 rounded-full bg-ink px-2 py-0.5 text-[10px] text-white">Copertina</span>}
              </div>
              <div className="mt-1 flex justify-between">
                <button type="button" className="h-8 w-8 rounded-full text-sm hover:bg-cream-dark disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Sposta a sinistra">
                  ←
                </button>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full text-sm text-bad hover:bg-bad/10"
                  onClick={() => {
                    setImages((prev) => prev.filter((x) => x.key !== img.key));
                    setSaved(false);
                  }}
                  aria-label="Rimuovi foto"
                >
                  ✕
                </button>
                <button type="button" className="h-8 w-8 rounded-full text-sm hover:bg-cream-dark disabled:opacity-30" disabled={i === images.length - 1} onClick={() => move(i, 1)} aria-label="Sposta a destra">
                  →
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-line text-sm text-muted hover:border-ink hover:text-ink"
          >
            <span className="text-2xl">+</span>
            Aggiungi
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </section>

      {/* INFO */}
      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Informazioni</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome (italiano) *">
            <input className="input" required maxLength={120} value={f.name_it} onChange={(e) => set("name_it", e.target.value)} />
          </Field>
          <Field label="Nome (inglese)">
            <input className="input" maxLength={120} value={f.name_en} placeholder="Se vuoto usa l'italiano" onChange={(e) => set("name_en", e.target.value)} />
          </Field>
          <Field label="Descrizione (italiano)">
            <textarea className="input min-h-32 py-3" value={f.description_it} onChange={(e) => set("description_it", e.target.value)} />
          </Field>
          <Field label="Descrizione (inglese)">
            <textarea className="input min-h-32 py-3" value={f.description_en} onChange={(e) => set("description_en", e.target.value)} />
          </Field>
          <Field label="Prezzo (€) *">
            <input className="input" required inputMode="decimal" placeholder="15,00" value={f.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Categoria">
            <select className="input" value={f.category_id} onChange={(e) => set("category_id", e.target.value)}>
              <option value="">— Nessuna —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_it}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Materiale">
            <input className="input" list="materials" value={f.material} onChange={(e) => set("material", e.target.value)} />
            <datalist id="materials">
              {["PLA", "PETG", "TPU", "ABS", "ASA", "PLA Silk", "PLA Matte"].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Field>
          <Field label="Dimensioni">
            <input className="input" placeholder="es. 18 × 10 × 8 cm" value={f.dimensions} onChange={(e) => set("dimensions", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* DISPONIBILITÀ */}
      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Disponibilità</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Stato">
            <select className="input" value={f.status} onChange={(e) => set("status", e.target.value as ProductStatus)}>
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quantità in scorta">
            <input className="input" type="number" min={0} inputMode="numeric" value={f.stock} onChange={(e) => set("stock", Number(e.target.value))} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6">
          <Toggle label="In evidenza in home" checked={f.featured} onChange={(v) => set("featured", v)} />
          <Toggle label="Visibile sul sito" checked={f.published} onChange={(v) => set("published", v)} />
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Link marketplace</h2>
        <p className="text-xs text-muted">Incolla il link dell&apos;annuncio. Sul sito compaiono solo i bottoni dei link inseriti.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {MARKETPLACES.map((m) => (
            <Field key={m} label={MARKETPLACE_LABELS[m]}>
              <input
                className="input"
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={f[`${m}_url`]}
                onChange={(e) => set(`${m}_url`, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </section>

      {/* BARRA AZIONI */}
      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-line bg-paper/95 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0 text-sm">
            {error && <p className="truncate text-bad" role="alert">{error}</p>}
            {saved && !error && <p className="text-ok">Salvato ✓</p>}
          </div>
          <div className="flex shrink-0 gap-2">
            {product && (
              <ConfirmButton
                action={() => deleteProduct(product.id)}
                confirm="Eliminare definitivamente questo prodotto e le sue foto?"
                className="btn-ghost text-bad"
              >
                Elimina
              </ConfirmButton>
            )}
            <button type="submit" className="btn-primary px-8" disabled={pending}>
              {uploading ? "Carico foto…" : pending ? "Salvo…" : "Salva"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-navy after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
      {label}
    </label>
  );
}
