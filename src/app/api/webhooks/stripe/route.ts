import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe";
import { decodeItems, recordPaidOrder } from "@/lib/payments/orders";

/**
 * FASE 2 – Webhook Stripe: quando un pagamento va a buon fine registra l'ordine.
 * La firma viene verificata con STRIPE_WEBHOOK_SECRET: nessuno può falsificare ordini.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "not configured" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      const items = decodeItems(session.metadata?.items ?? "");
      // Usa i nomi delle righe Stripe (stesso ordine degli articoli)
      items.forEach((it, idx) => (it.name = lineItems.data[idx]?.description ?? it.name));
      await recordPaidOrder({
        provider: "stripe",
        providerRef: session.id,
        email: session.customer_details?.email ?? null,
        customerName: session.customer_details?.name ?? null,
        shipping: (session.collected_information?.shipping_details as unknown as Record<string, unknown>) ?? null,
        items,
        totalCents: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
      });
    }
  }
  return NextResponse.json({ received: true });
}
