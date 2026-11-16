import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { MARKETPLACES, MARKETPLACE_LABELS } from "@/lib/config";
import type { AdminStats } from "@/lib/types";
import { getPaymentsState } from "@/lib/payments/config";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteDemoProducts, resetStats } from "../actions";

const PERIODS = [7, 30, 90, 365];

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const days = PERIODS.includes(Number(sp.days)) ? Number(sp.days) : 30;
  const [{ data, error }, payments] = await Promise.all([supabase.rpc("admin_stats", { p_days: days }), getPaymentsState()]);
  const stats = data as AdminStats | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-1 rounded-full bg-paper p-1 text-sm">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/admin?days=${p}`}
              className={`rounded-full px-3 py-1 ${p === days ? "bg-ink text-white" : "text-muted"}`}
            >
              {p === 365 ? "1 anno" : `${p} gg`}
            </Link>
          ))}
        </div>
      </div>

      {error && <p className="card p-4 text-sm text-bad">Errore nel caricamento delle statistiche: {error.message}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Prodotti" value={stats.products_total} hint={`${stats.products_published} pubblicati`} />
            <Stat label="Visite prodotti" value={stats.views} hint={`ultimi ${days} giorni`} />
            <Stat label="Click marketplace" value={stats.clicks} hint={`ultimi ${days} giorni`} />
            <Stat
              label="Conversione click"
              value={stats.views ? `${Math.round((stats.clicks / stats.views) * 100)}%` : "–"}
              hint="click / visite"
            />
          </div>

          <section className="card p-5">
            <h2 className="font-semibold">Click per marketplace</h2>
            <div className="mt-4 space-y-3">
              {MARKETPLACES.map((m) => {
                const n = stats.clicks_by_marketplace[m] ?? 0;
                const pct = stats.clicks ? (n / stats.clicks) * 100 : 0;
                return (
                  <div key={m}>
                    <div className="flex justify-between text-sm">
                      <span>{MARKETPLACE_LABELS[m]}</span>
                      <span className="tabular-nums text-muted">{n}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-cream-dark">
                      <div className="h-2 rounded-full bg-navy" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Prodotti più visti</h2>
            {stats.top_products.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Ancora nessuna visita nel periodo selezionato.</p>
            ) : (
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="py-2 font-normal">Prodotto</th>
                    <th className="py-2 text-right font-normal">Visite</th>
                    <th className="py-2 text-right font-normal">Click</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {stats.top_products.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 pr-2">
                        <Link href={`/admin/products/${p.id}`} className="hover:underline">
                          {p.name_it}
                        </Link>
                      </td>
                      <td className="py-2 text-right tabular-nums">{p.views}</td>
                      <td className="py-2 text-right tabular-nums">{p.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="card p-5">
              <h2 className="font-semibold">Pagamenti online (Fase 2)</h2>
              <p className="mt-2 text-sm text-muted">
                {payments.enabled ? "Attivi: i clienti possono pagare sul sito." : "Spenti: il sito mostra solo i link ai marketplace."}
              </p>
              <Link href="/admin/orders" className="btn-outline mt-4 min-h-9 text-xs">
                Vai agli ordini
              </Link>
            </div>
            <div className="card p-5">
              <h2 className="font-semibold">Pulizia</h2>
              {stats.products_demo > 0 ? (
                <p className="mt-2 text-sm text-muted">Ci sono {stats.products_demo} prodotti demo.</p>
              ) : (
                <p className="mt-2 text-sm text-muted">Nessun prodotto demo presente.</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {stats.products_demo > 0 && (
                  <ConfirmButton action={deleteDemoProducts} confirm="Eliminare tutti i prodotti demo?" className="btn-outline min-h-9 text-xs">
                    Elimina prodotti demo
                  </ConfirmButton>
                )}
                <ConfirmButton action={resetStats} confirm="Azzerare tutte le statistiche di visite e click?" className="btn-ghost min-h-9 text-xs">
                  Azzera statistiche
                </ConfirmButton>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
