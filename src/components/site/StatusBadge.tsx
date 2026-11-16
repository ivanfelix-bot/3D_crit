import type { ProductStatus } from "@/lib/types";

const styles: Record<ProductStatus, string> = {
  available: "bg-ok/10 text-ok",
  made_to_order: "bg-warn/10 text-warn",
  out_of_stock: "bg-bad/10 text-bad",
};

export function StatusBadge({ status, label }: { status: ProductStatus; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
