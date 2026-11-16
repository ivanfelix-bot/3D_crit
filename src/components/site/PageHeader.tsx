export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pb-10 pt-12 sm:pt-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-muted">{subtitle}</p>}
    </div>
  );
}
