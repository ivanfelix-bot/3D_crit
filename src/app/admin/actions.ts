"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { IMAGES_BUCKET, MARKETPLACES } from "@/lib/config";
import { slugify } from "@/lib/format";
import { ORDER_STATUSES, PRODUCT_STATUSES, type OrderStatus, type ProductStatus } from "@/lib/types";

/**
 * Azioni del pannello admin (eseguite SOLO sul server).
 * Ogni azione chiama requireAdmin() e in più il database applica la RLS:
 * doppio controllo, anche se qualcuno chiamasse queste funzioni a mano.
 */

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

/** Aggiorna subito le pagine pubbliche dopo una modifica. */
function refreshSite() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Login / logout
// ---------------------------------------------------------------------------
export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Inserisci email e password." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Credenziali non valide." };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "Questo account non ha accesso all'area admin." };
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Prodotti
// ---------------------------------------------------------------------------
export interface ProductInput {
  id?: string;
  slug?: string;
  name_it: string;
  name_en: string;
  description_it: string;
  description_en: string;
  price: string; // in euro, es. "12,50"
  material: string;
  dimensions: string;
  status: ProductStatus;
  stock: number;
  featured: boolean;
  published: boolean;
  category_id: string | null;
  vinted_url: string;
  ebay_url: string;
  amazon_url: string;
  wallapop_url: string;
  images: { url: string; storage_path: string | null; alt: string }[];
}

function cleanUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  try {
    const u = new URL(v.startsWith("http") ? v : `https://${v}`);
    if (u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

function parsePrice(value: string): number | null {
  const n = Number(value.replace(/\s|€/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 10000) return null;
  return Math.round(n * 100);
}

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const name_it = input.name_it.trim();
  const name_en = input.name_en.trim() || name_it;
  if (!name_it) return { ok: false, error: "Il nome in italiano è obbligatorio." };
  const price_cents = parsePrice(input.price);
  if (price_cents === null) return { ok: false, error: "Prezzo non valido." };
  if (!PRODUCT_STATUSES.includes(input.status)) return { ok: false, error: "Stato non valido." };
  const stock = Math.max(0, Math.floor(Number(input.stock) || 0));

  const links: Record<string, string | null> = {};
  for (const m of MARKETPLACES) {
    const raw = input[`${m}_url`];
    const cleaned = cleanUrl(raw);
    if (raw.trim() && !cleaned) return { ok: false, error: `Link ${m} non valido (deve iniziare con https://).` };
    links[`${m}_url`] = cleaned;
  }

  // Slug unico generato dal nome italiano
  let slug = slugify(input.slug?.trim() || name_it) || "prodotto";
  const { data: clash } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
  if (clash && clash.id !== input.id) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const row = {
    slug,
    name_it,
    name_en,
    description_it: input.description_it.trim(),
    description_en: input.description_en.trim(),
    price_cents,
    material: input.material.trim(),
    dimensions: input.dimensions.trim(),
    status: input.status,
    stock,
    featured: Boolean(input.featured),
    published: Boolean(input.published),
    category_id: input.category_id || null,
    ...links,
  };

  let id = input.id;
  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase.from("products").insert(row).select("id").single();
    if (error) return { ok: false, error: error.message };
    id = data.id as string;
  }

  // Sincronizza le foto: rimuove quelle tolte (anche dallo storage) e salva l'ordine
  const { data: existing } = await supabase.from("product_images").select("id, url, storage_path").eq("product_id", id);
  const keepUrls = new Set(input.images.map((i) => i.url));
  const removed = (existing ?? []).filter((e) => !keepUrls.has(e.url));
  if (removed.length) {
    await supabase.from("product_images").delete().in("id", removed.map((r) => r.id));
    const paths = removed.map((r) => r.storage_path).filter((p): p is string => Boolean(p));
    if (paths.length) await supabase.storage.from(IMAGES_BUCKET).remove(paths);
  }
  const byUrl = new Map((existing ?? []).map((e) => [e.url, e.id]));
  for (const [index, img] of input.images.entries()) {
    const existingId = byUrl.get(img.url);
    if (existingId) {
      await supabase.from("product_images").update({ sort_order: index, alt: img.alt }).eq("id", existingId);
    } else {
      const { error } = await supabase
        .from("product_images")
        .insert({ product_id: id, url: img.url, storage_path: img.storage_path, alt: img.alt, sort_order: index });
      if (error) return { ok: false, error: error.message };
    }
  }

  refreshSite();
  return { ok: true, id };
}

async function deleteProductsWhere(filter: { id?: string; demo?: boolean }) {
  const { supabase } = await requireAdmin();
  let query = supabase.from("products").select("id, product_images(storage_path)");
  if (filter.id) query = query.eq("id", filter.id);
  if (filter.demo) query = query.eq("is_demo", true);
  const { data } = await query;
  const paths = (data ?? [])
    .flatMap((p) => (p.product_images as { storage_path: string | null }[]) ?? [])
    .map((i) => i.storage_path)
    .filter((p): p is string => Boolean(p));
  if (paths.length) await supabase.storage.from(IMAGES_BUCKET).remove(paths);
  const ids = (data ?? []).map((p) => p.id);
  if (ids.length) {
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) throw new Error(error.message);
  }
  refreshSite();
  return ids.length;
}

export async function deleteProduct(id: string) {
  await deleteProductsWhere({ id });
  redirect("/admin/products");
}

export async function deleteDemoProducts() {
  await deleteProductsWhere({ demo: true });
  revalidatePath("/admin", "layout");
}

export async function toggleProductFlag(id: string, field: "featured" | "published", value: boolean) {
  if (field !== "featured" && field !== "published") return;
  const { supabase } = await requireAdmin();
  await supabase.from("products").update({ [field]: Boolean(value) }).eq("id", id);
  refreshSite();
}

export async function setProductStatus(id: string, status: ProductStatus) {
  if (!PRODUCT_STATUSES.includes(status)) return;
  const { supabase } = await requireAdmin();
  await supabase.from("products").update({ status }).eq("id", id);
  refreshSite();
}

// ---------------------------------------------------------------------------
// Categorie
// ---------------------------------------------------------------------------
export async function saveCategory(_prev: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name_it = String(formData.get("name_it") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim() || name_it;
  const sort_order = Number(formData.get("sort_order") ?? 0) || 0;
  if (!name_it) return { error: "Il nome in italiano è obbligatorio." };

  const row = { name_it, name_en, sort_order };
  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert({ ...row, slug: slugify(name_it) || `categoria-${Date.now()}` });
  if (error) return { error: error.code === "23505" ? "Esiste già una categoria con questo nome." : error.message };
  refreshSite();
  return { ok: true };
}

export async function deleteCategory(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("categories").delete().eq("id", id);
  refreshSite();
}

// ---------------------------------------------------------------------------
// Impostazioni, ordini, statistiche
// ---------------------------------------------------------------------------
export async function saveSettings(_prev: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  const { supabase } = await requireAdmin();
  const contact_email = String(formData.get("contact_email") ?? "").trim();
  const tiktokRaw = String(formData.get("tiktok_url") ?? "").trim();
  if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) return { error: "Email non valida." };
  let tiktok_url = "";
  if (tiktokRaw) {
    tiktok_url = tiktokRaw.startsWith("@") ? `https://www.tiktok.com/${tiktokRaw}` : cleanUrl(tiktokRaw) ?? "";
    if (!tiktok_url) return { error: "Link TikTok non valido." };
  }
  const { error } = await supabase.from("site_settings").update({ contact_email, tiktok_url }).eq("id", 1);
  if (error) return { error: error.message };
  refreshSite();
  return { ok: true };
}

export async function setPaymentsEnabled(enabled: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("site_settings").update({ payments_enabled: enabled }).eq("id", 1);
  refreshSite();
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  if (!ORDER_STATUSES.includes(status)) return;
  const { supabase } = await requireAdmin();
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/orders");
}

export async function resetStats() {
  const { supabase } = await requireAdmin();
  await supabase.from("events").delete().gt("id", 0);
  revalidatePath("/admin");
}
