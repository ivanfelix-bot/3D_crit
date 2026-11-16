import Image from "next/image";

/** Foto prodotto ottimizzata (o segnaposto se il prodotto non ha foto). */
export function ProductPhoto({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-cream-dark text-muted ${className}`}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z M3 7l9 5 9-5 M12 12v10" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
