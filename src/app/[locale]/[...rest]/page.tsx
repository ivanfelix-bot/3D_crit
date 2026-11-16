import { notFound } from "next/navigation";

/** Qualsiasi URL sconosciuto dentro /it o /en mostra la pagina 404 localizzata. */
export default function CatchAll() {
  notFound();
}
