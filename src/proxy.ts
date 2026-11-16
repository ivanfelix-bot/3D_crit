import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";

/**
 * Proxy (ex middleware) eseguito prima di ogni pagina:
 *  1. /admin  → aggiorna la sessione Supabase e rimanda al login se non autenticato.
 *               (Il controllo "è admin?" vero avviene lato server e nel database.)
 *  2. pagine pubbliche senza lingua nell'URL → reindirizza a /it o /en.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return handleAdmin(request);
  }

  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${detectLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

/** Lingua: cookie scelto dall'utente, poi lingua del browser, altrimenti italiano. */
function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && (LOCALES as readonly string[]).includes(cookie)) return cookie;
  const accept = request.headers.get("accept-language")?.toLowerCase() ?? "";
  const first = accept.split(",")[0]?.trim().slice(0, 2);
  if (first === "en") return "en";
  return DEFAULT_LOCALE;
}

async function handleAdmin(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = request.nextUrl.pathname === "/admin/login";
  if (!user && !isLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  // Esclude API, file statici, immagini ottimizzate e file con estensione (favicon, sitemap, ecc.)
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
