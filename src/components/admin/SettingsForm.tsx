"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/admin/actions";

export function SettingsForm({ email, tiktok }: { email: string; tiktok: string }) {
  const [state, action, pending] = useActionState(saveSettings, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="label">Email di contatto</span>
        <input name="contact_email" type="email" defaultValue={email} className="input" placeholder="info@…" />
      </label>
      <label className="block">
        <span className="label">Profilo TikTok</span>
        <input name="tiktok_url" defaultValue={tiktok} className="input" placeholder="https://www.tiktok.com/@3dcrit oppure @3dcrit" />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Salvo…" : "Salva"}
        </button>
        {state?.error && <p className="text-sm text-bad">{state.error}</p>}
        {state?.ok && <p className="text-sm text-ok">Salvato ✓</p>}
      </div>
    </form>
  );
}
