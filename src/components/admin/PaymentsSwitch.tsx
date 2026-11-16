"use client";

import { useOptimistic, useTransition } from "react";
import { setPaymentsEnabled } from "@/app/admin/actions";

/** Interruttore della Fase 2 (pagamenti online). */
export function PaymentsSwitch({ enabled, locked }: { enabled: boolean; locked: boolean }) {
  const [pending, start] = useTransition();
  const [value, setValue] = useOptimistic(enabled);
  return (
    <div>
      <label className={`flex items-center gap-3 text-sm ${locked ? "opacity-60" : "cursor-pointer"}`}>
        <input
          type="checkbox"
          className="peer sr-only"
          checked={value}
          disabled={locked || pending}
          onChange={(e) => {
            const next = e.target.checked;
            if (next && !window.confirm("Attivare i pagamenti online sul sito?")) return;
            start(async () => {
              setValue(next);
              await setPaymentsEnabled(next);
            });
          }}
        />
        <span className="relative h-7 w-12 rounded-full bg-line transition-colors peer-checked:bg-navy after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
        <span className="font-medium">{value ? "Pagamenti attivi" : "Pagamenti spenti"}</span>
      </label>
      {locked && <p className="mt-2 text-xs text-muted">Forzato dalla variabile d&apos;ambiente PAYMENTS_ENABLED=true su Vercel.</p>}
    </div>
  );
}
