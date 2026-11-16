import Link from "next/link";
import { it } from "@/lib/i18n/it";
import { en } from "@/lib/i18n/en";

/** Pagina 404 (bilingue, perché non riceve la lingua come parametro). */
export default function NotFound() {
  return (
    <div className="container-site flex flex-col items-center py-32 text-center">
      <p className="text-6xl font-semibold text-line">404</p>
      <h1 className="mt-4 text-2xl font-semibold">{it.notFound.title}</h1>
      <p className="mt-1 text-muted">{en.notFound.title}</p>
      <p className="mt-4 text-muted">{it.notFound.text}</p>
      <Link href="/" className="btn-primary mt-8">
        {it.notFound.back} / {en.notFound.back}
      </Link>
    </div>
  );
}
