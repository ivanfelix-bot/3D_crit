"use client";

import { useTransition } from "react";

/** Bottone che chiede conferma prima di eseguire un'azione server. */
export function ConfirmButton({
  action,
  confirm,
  className,
  children,
}: {
  action: () => Promise<unknown>;
  confirm: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirm)) start(async () => void (await action()));
      }}
    >
      {pending ? "Attendi…" : children}
    </button>
  );
}
