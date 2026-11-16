"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState(login, initialError ? { error: initialError } : undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      {state?.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Accesso…" : "Accedi"}
      </button>
    </form>
  );
}
