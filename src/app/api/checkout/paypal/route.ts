import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/config";
import { getPaymentsState } from "@/lib/payments/config";
import { parseCheckoutRequest, validateCart } from "@/lib/payments/cart";
import { encodeItems } from "@/lib/payments/orders";
import { cents, paypalRequest } from "@/lib/payments/paypal";

/** FASE 2 – Crea un ordine PayPal e restituisce il link di approvazione. */
export async function POST(request: NextRequest) {
  const payments = await getPaymentsState();
  if (!payments.paypal) return NextResponse.json({ error: "payments disabled" }, { status: 403 });

  const parsed = parseCheckoutRequest(await request.json().catch(() => null));
  if (!parsed) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const cart = await validateCart(parsed);
  if (!cart) return NextResponse.json({ error: "invalid cart" }, { status: 409 });

  const site = getSiteUrl();
  try {
    const order = await paypalRequest<{ id: string; links: { rel: string; href: string }[] }>("/v2/checkout/orders", {
      method: "POST",
      body: {
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: encodeItems(cart.items).slice(0, 127),
            amount: {
              currency_code: "EUR",
              value: cents(cart.totalCents),
              breakdown: {
                item_total: { currency_code: "EUR", value: cents(cart.subtotalCents) },
                shipping: { currency_code: "EUR", value: cents(cart.shippingCents) },
              },
            },
            items: cart.items.map((i) => ({
              name: i.name.slice(0, 127),
              quantity: String(i.qty),
              unit_amount: { currency_code: "EUR", value: cents(i.unit_cents) },
              sku: i.product_id,
            })),
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              locale: cart.locale === "it" ? "it-IT" : "en-US",
              shipping_preference: "GET_FROM_FILE",
              user_action: "PAY_NOW",
              return_url: `${site}/api/checkout/paypal/capture?locale=${cart.locale}`,
              cancel_url: `${site}/${cart.locale}/checkout/cancel`,
            },
          },
        },
      },
    });
    const approve = order.links.find((l) => l.rel === "payer-action" || l.rel === "approve");
    if (!approve) throw new Error("link PayPal mancante");
    return NextResponse.json({ url: approve.href });
  } catch (e) {
    console.error("paypal checkout", e);
    return NextResponse.json({ error: "paypal error" }, { status: 502 });
  }
}
