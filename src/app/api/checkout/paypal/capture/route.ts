import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/config";
import { recordPaidOrder } from "@/lib/payments/orders";
import { paypalRequest } from "@/lib/payments/paypal";
import type { OrderItem } from "@/lib/types";

interface PaypalCapture {
  id: string;
  status: string;
  payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
  purchase_units: {
    shipping?: Record<string, unknown>;
    items?: { name: string; quantity: string; sku?: string; unit_amount: { value: string } }[];
    payments?: { captures?: { amount: { value: string; currency_code: string } }[] };
  }[];
}

/**
 * FASE 2 – Ritorno da PayPal: cattura il pagamento (lato server, verificato
 * direttamente con PayPal) e registra l'ordine.
 */
export async function GET(request: NextRequest) {
  const site = getSiteUrl();
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "it";
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !/^[A-Z0-9]+$/i.test(token)) return NextResponse.redirect(`${site}/${locale}/checkout/cancel`);

  try {
    const capture = await paypalRequest<PaypalCapture>(`/v2/checkout/orders/${token}/capture`, { method: "POST" });
    if (capture.status !== "COMPLETED") throw new Error(`stato ${capture.status}`);
    const unit = capture.purchase_units[0];
    const items: OrderItem[] = (unit.items ?? []).map((i) => ({
      product_id: i.sku ?? "",
      name: i.name,
      qty: Number(i.quantity),
      unit_cents: Math.round(Number(i.unit_amount.value) * 100),
    }));
    const paid = unit.payments?.captures?.[0]?.amount;
    await recordPaidOrder({
      provider: "paypal",
      providerRef: capture.id,
      email: capture.payer?.email_address ?? null,
      customerName: [capture.payer?.name?.given_name, capture.payer?.name?.surname].filter(Boolean).join(" ") || null,
      shipping: unit.shipping ?? null,
      items,
      totalCents: paid ? Math.round(Number(paid.value) * 100) : 0,
      currency: paid?.currency_code ?? "EUR",
    });
    return NextResponse.redirect(`${site}/${locale}/checkout/success`);
  } catch (e) {
    console.error("paypal capture", e);
    return NextResponse.redirect(`${site}/${locale}/checkout/cancel`);
  }
}
