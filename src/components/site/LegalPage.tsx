import type { LegalSection } from "@/lib/legal";
import { PageHeader } from "./PageHeader";

export function LegalPage({ title, updatedLabel, updated, sections }: { title: string; updatedLabel: string; updated: string; sections: LegalSection[] }) {
  return (
    <div className="container-site max-w-3xl">
      <PageHeader title={title} subtitle={`${updatedLabel}: ${updated}`} />
      <div className="prose-site">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.list && (
              <ul>
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
