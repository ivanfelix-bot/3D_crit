import { NextResponse, type NextRequest } from "next/server";
import { getPublicClient } from "@/lib/supabase/public";
import { MARKETPLACES } from "@/lib/config";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;

/**
 * Registra visite e click in modo anonimo.
 * La scrittura avviene tramite la funzione track_event del database,
 * che valida i dati: il pubblico non può inserire nulla direttamente.
 */
export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return new NextResponse(null, { status: 204 });

  let body: { type?: string; productId?: string; marketplace?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { type, productId, marketplace } = body;
  if ((type !== "view" && type !== "click") || !productId || !UUID.test(productId)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (type === "click" && !MARKETPLACES.includes(marketplace as (typeof MARKETPLACES)[number])) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const supabase = getPublicClient();
  if (supabase) {
    const { error } = await supabase.rpc("track_event", {
      p_type: type,
      p_product_id: productId,
      p_marketplace: type === "click" ? marketplace : null,
    });
    if (error) console.error("track_event", error.message);
  }
  return new NextResponse(null, { status: 204 });
}
