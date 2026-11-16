import "server-only";
import { getPublicClient } from "./supabase/public";
import type { Category, ProductWithImages, SiteSettings } from "./types";

/**
 * Letture pubbliche dal database (solo dati visibili a tutti grazie alla RLS).
 * In caso di errore o Supabase non configurato restituiscono valori vuoti,
 * così il sito non va mai in errore.
 */

const PRODUCT_SELECT = "*, product_images(*), categories(id, slug, name_it, name_en)";

function sortImages(p: ProductWithImages): ProductWithImages {
  return { ...p, product_images: [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order) };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("name_it");
  if (error) {
    console.error("getCategories", error.message);
    return [];
  }
  return data as Category[];
}

export interface ProductFilter {
  categorySlug?: string;
  featuredOnly?: boolean;
  limit?: number;
}

export async function getProducts(filter: ProductFilter = {}): Promise<ProductWithImages[]> {
  const supabase = getPublicClient();
  if (!supabase) return [];
  let query = supabase
    .from("products")
    .select(filter.categorySlug ? PRODUCT_SELECT.replace("categories(", "categories!inner(") : PRODUCT_SELECT)
    .eq("published", true)
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (filter.featuredOnly) query = query.eq("featured", true);
  if (filter.categorySlug) query = query.eq("categories.slug", filter.categorySlug);
  if (filter.limit) query = query.limit(filter.limit);
  const { data, error } = await query;
  if (error) {
    console.error("getProducts", error.message);
    return [];
  }
  return (data as unknown as ProductWithImages[]).map(sortImages);
}

export async function getProductBySlug(slug: string): Promise<ProductWithImages | null> {
  const supabase = getPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) {
    console.error("getProductBySlug", error.message);
    return null;
  }
  return data ? sortImages(data as unknown as ProductWithImages) : null;
}

export async function getSettings(): Promise<SiteSettings | null> {
  const supabase = getPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) {
    console.error("getSettings", error.message);
    return null;
  }
  return data as SiteSettings | null;
}
