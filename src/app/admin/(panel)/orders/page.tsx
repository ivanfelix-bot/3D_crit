import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";
import { getPaymentsState } from "@/lib/payments/config";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export default async function OrdersPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, payments] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200),
    getPaymentsState(),
  ]);
  const orders = (data ?? []) as Order[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ordini</h1>
      {!payments.enabled && (
        <p className="card p-4 text-sm text-muted">
          I pagamenti online sono <strong>spenti</strong> (Fase 2). Quando li attiverai dalle Impostazioni, gli ordini pagati con
          Stripe o PayPal compariranno qui automaticamente.
        </p>
      )}
      {orders.length === 0 ? (
        <p className="card p-10 text-center text-muted">Nessun ordine.</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => (
            <li key={o.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {formatPrice(o.total_cents)} · <span className="uppercase text-muted">{o.provider}</span>
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(o.created_at).toLocaleString("it-IT", { timeZone: "Europe/Rome" })} · {o.customer_name ?? "—"} · {o.email ?? "—"}
                  </p>
                </div>
                <OrderStatusSelect id={o.id} status={o.status} />
              </div>
              <ul className="mt-3 text-sm text-muted">
                {o.items.map((it, idx) => (
                  <li key={idx}>
                    {it.qty} × {it.name} ({formatPrice(it.unit_cents)})
                  </li>
                ))}
              </ul>
              {o.shipping && (
                <details className="mt-2 text-xs text-muted">
                  <summary className="cursor-pointer">Indirizzo di spedizione</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all">{JSON.stringify(o.shipping, null, 2)}</pre>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
