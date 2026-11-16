/** Tipi condivisi che rispecchiano le tabelle del database (supabase/schema.sql). */

export type ProductStatus = "available" | "out_of_stock" | "made_to_order";
export const PRODUCT_STATUSES: ProductStatus[] = ["available", "made_to_order", "out_of_stock"];

export interface Category {
  id: string;
  slug: string;
  name_it: string;
  name_en: string;
  sort_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  storage_path: string | null;
  alt: string;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name_it: string;
  name_en: string;
  description_it: string;
  description_en: string;
  price_cents: number;
  material: string;
  dimensions: string;
  status: ProductStatus;
  stock: number;
  featured: boolean;
  published: boolean;
  is_demo: boolean;
  category_id: string | null;
  vinted_url: string | null;
  ebay_url: string | null;
  amazon_url: string | null;
  wallapop_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Prodotto con foto e categoria, come viene letto dalle pagine. */
export interface ProductWithImages extends Product {
  product_images: ProductImage[];
  categories: Pick<Category, "id" | "slug" | "name_it" | "name_en"> | null;
}

export interface SiteSettings {
  id: number;
  payments_enabled: boolean;
  contact_email: string;
  tiktok_url: string;
  updated_at: string;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled" | "refunded";
export const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "cancelled", "refunded"];

export interface OrderItem {
  product_id: string;
  name: string;
  qty: number;
  unit_cents: number;
}

export interface Order {
  id: string;
  provider: "stripe" | "paypal";
  provider_ref: string;
  status: OrderStatus;
  email: string | null;
  customer_name: string | null;
  shipping: Record<string, unknown> | null;
  items: OrderItem[];
  total_cents: number;
  currency: string;
  notes: string;
  created_at: string;
}

export interface AdminStats {
  products_total: number;
  products_published: number;
  products_demo: number;
  views: number;
  clicks: number;
  clicks_by_marketplace: Partial<Record<"vinted" | "ebay" | "amazon" | "wallapop", number>>;
  top_products: { id: string; name_it: string; views: number; clicks: number }[];
}
