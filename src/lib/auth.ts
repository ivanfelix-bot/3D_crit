import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";
import { isSupabaseConfigured } from "./config";

/**
 * Verifica lato server che la richiesta arrivi dall'admin.
 * Da chiamare in OGNI pagina e azione dell'admin (oltre alla RLS del database).
 */
export async function requireAdmin() {
  if (!isSupabaseConfigured()) redirect("/admin/login");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) {
    redirect("/admin/login?error=forbidden");
  }
  return { supabase, user };
}
