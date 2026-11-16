"use client";

import { useTransition } from "react";
import { setOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

export function OrderStatusSelect({ id, status }: { id: string; status: OrderStatus }) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Stato ordine"
      className="rounded-lg border border-line bg-paper px-2 py-1.5 text-sm"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => setOrderStatus(id, e.target.value as OrderStatus))}
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
