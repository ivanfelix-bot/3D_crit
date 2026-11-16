import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/it/cart", "/en/cart", "/it/checkout", "/en/checkout"] }],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
