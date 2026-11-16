import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (isAdmin === true) redirect("/admin");
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <p className="text-center text-xl font-semibold">
          3D<span className="text-navy"> Crit</span>
        </p>
        <h1 className="mt-2 text-center text-sm text-muted">Area riservata</h1>
        <div className="card mt-8 p-6">
          {!isSupabaseConfigured() ? (
            <p className="text-sm text-bad">Supabase non è configurato: imposta le variabili d&apos;ambiente.</p>
          ) : (
            <LoginForm initialError={error === "forbidden" ? "Questo account non ha accesso all'area admin." : undefined} />
          )}
        </div>
      </div>
    </div>
  );
}
