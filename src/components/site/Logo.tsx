import Link from "next/link";
import { BRAND_NAME } from "@/lib/config";

/**
 * Logo testuale. Per usare un logo grafico in futuro basta sostituire
 * il contenuto del <Link> con <Image src="/logo.svg" … />.
 */
export function Logo({ href, className = "" }: { href: string; className?: string }) {
  return (
    <Link href={href} className={`text-xl font-semibold tracking-tight text-ink ${className}`} aria-label={BRAND_NAME}>
      3D<span className="text-navy"> Crit</span>
    </Link>
  );
}
