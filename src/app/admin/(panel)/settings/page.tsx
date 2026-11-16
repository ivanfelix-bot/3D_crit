import { requireAdmin } from "@/lib/auth";
import type { SiteSettings } from "@/lib/types";
import { getPaymentsState, isPaypalConfigured, isServiceRoleConfigured, isStripeConfigured } from "@/lib/payments/config";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PaymentsSwitch } from "@/components/admin/PaymentsSwitch";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  const settings = data as SiteSettings;
  const payments = await getPaymentsState();
  const envForced = process.env.PAYMENTS_ENABLED === "true";

  const checks = [
    { label: "Stripe (STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET)", ok: isStripeConfigured() },
    { label: "PayPal (PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET)", ok: isPaypalConfigured() },
    { label: "Registrazione ordini (SUPABASE_SERVICE_ROLE_KEY)", ok: isServiceRoleConfigured() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Impostazioni</h1>

      <section className="card p-5">
        <h2 className="font-semibold">Contatti</h2>
        <p className="mt-1 text-xs text-muted">Mostrati nella pagina Contatti e nel footer del sito.</p>
        <div className="mt-4">
          <SettingsForm email={settings.contact_email} tiktok={settings.tiktok_url} />
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Pagamenti online (Fase 2)</h2>
        <p className="mt-1 text-sm text-muted">
          Quando è attivo, il sito mostra carrello e checkout con carta (Stripe) e PayPal, oltre ai link dei marketplace.
          Il checkout si accende solo se le chiavi del provider sono configurate su Vercel.
        </p>
        <div className="mt-4">
          <PaymentsSwitch enabled={settings.payments_enabled || envForced} locked={envForced} />
        </div>
        <ul className="mt-5 space-y-1.5 text-sm">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2">
              <span className={c.ok ? "text-ok" : "text-muted"}>{c.ok ? "✓" : "○"}</span>
              <span className={c.ok ? "" : "text-muted"}>{c.label}</span>
            </li>
          ))}
        </ul>
        <p className={`mt-4 text-sm font-medium ${payments.enabled ? "text-ok" : "text-muted"}`}>
          Stato attuale: {payments.enabled ? "checkout ATTIVO sul sito" : "checkout spento"}
        </p>
      </section>
    </div>
  );
}
