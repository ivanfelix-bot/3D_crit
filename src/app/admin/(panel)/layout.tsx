import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import { AdminNav } from "@/components/admin/AdminNav";

// L'area admin è sempre dinamica e protetta: ogni richiesta verifica l'admin sul server.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/admin" className="font-semibold">
            3D<span className="text-navy"> Crit</span> <span className="text-sm font-normal text-muted">admin</span>
          </Link>
          <div className="hidden md:block">
            <AdminNav />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/it" target="_blank" className="btn-ghost min-h-9 px-3 text-xs">
              Vedi sito ↗
            </Link>
            <form action={logout}>
              <button type="submit" className="btn-ghost min-h-9 px-3 text-xs" title={user.email ?? ""}>
                Esci
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      {/* Barra di navigazione in basso su telefono */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper md:hidden">
        <AdminNav mobile />
      </div>
    </div>
  );
}
