import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/config";
import { getPaymentsState } from "@/lib/payments/config";
import { parseCheckoutRequest, validateCart } from "@/lib/payments/cart";
import { encodeItems } from "@/lib/payments/orders";
import { getStripe } from "@/lib/payments/stripe";

/** FASE 2 – Crea una sessione Stripe Checkout e restituisce l'URL di pagamento. */
export async function POST(request: NextRequest) {
  const payments = await getPaymentsState();
  if (!payments.stripe) return NextResponse.json({ error: "payments disabled" }, { status: 403 });

  const parsed = parseCheckoutRequest(await request.json().catch(() => null));
  if (!parsed) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const cart = await validateCart(parsed);
  if (!cart) return NextResponse.json({ error: "invalid cart" }, { status: 409 });

  const site = getSiteUrl();
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      locale: cart.locale === "it" ? "it" : "en",
      line_items: cart.items.map((i) => ({
        quantity: i.qty,
        price_data: { currency: "eur", unit_amount: i.unit_cents, product_data: { name: i.name } },
      })),
      shipping_address_collection: { allowed_countries: ["IT", "SM", "VA"] },
      shipping_options:
        cart.shippingCents > 0
          ? [{ shipping_rate_data: { type: "fixed_amount", display_name: "Spedizione", fixed_amount: { amount: cart.shippingCents, currency: "eur" } } }]
          : undefined,
      metadata: { items: encodeItems(cart.items) },
      success_url: `${site}/${cart.locale}/checkout/success`,
      cancel_url: `${site}/${cart.locale}/checkout/cancel`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("stripe checkout", e);
    return NextResponse.json({ error: "stripe error" }, { status: 502 });
  }
}
