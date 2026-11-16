import "server-only";
import Stripe from "stripe";

/** FASE 2 – Client Stripe (chiave segreta solo lato server). */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY non configurata");
  return new Stripe(key);
}
