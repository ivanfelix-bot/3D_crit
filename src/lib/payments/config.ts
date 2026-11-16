import "server-only";
import { getSettings } from "../data";

/**
 * FASE 2 – Pagamenti.
 * Il checkout è attivo se:
 *   (variabile PAYMENTS_ENABLED=true  OPPURE  interruttore attivo nell'admin)
 *   E almeno un provider (Stripe o PayPal) ha le chiavi configurate.
 * Finché non attivi nulla, il sito resta un catalogo con i link ai marketplace.
 */

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export function isPaypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export function isServiceRoleConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export interface PaymentsState {
  enabled: boolean;
  stripe: boolean;
  paypal: boolean;
}

export async function getPaymentsState(): Promise<PaymentsState> {
  const stripe = isStripeConfigured();
  const paypal = isPaypalConfigured();
  const envSwitch = process.env.PAYMENTS_ENABLED === "true";
  const adminSwitch = envSwitch ? true : Boolean((await getSettings())?.payments_enabled);
  const enabled = (envSwitch || adminSwitch) && (stripe || paypal) && isServiceRoleConfigured();
  return { enabled, stripe: enabled && stripe, paypal: enabled && paypal };
}
