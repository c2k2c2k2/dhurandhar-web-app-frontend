import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { focusAreas } from "@/modules/landing/content";

const focusAreaTooltips: Record<string, string> = {
  books: "Learn about updated study books",
  "career-guidance": "Learn about career guidance support",
  "spoken-english": "Learn about spoken English practice",
  "question-banks": "Learn about question papers and practice sets",
  "interview-guidance": "Learn about interview guidance",
};

export function ExamsSection() {
  return (
    <section id="exams" className="scroll-mt-24 py-14 md:py-18">
      <PageContainer className="max-w-6xl">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary dark:text-brand-gold">
            मुख्य अभ्यास क्षेत्रे
          </p>
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            धुरंधर अकॅडमीची 5 कोर सेवा
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            थेट मूल्यावर लक्ष: कंटेंट, सराव, संवाद कौशल्य, करिअर दिशा आणि
            मुलाखत तयारी.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {focusAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <article
                key={area.id}
                className="group flex h-full flex-col rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 dark:hover:border-brand-gold/45 motion-safe:animate-fade-up"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 dark:bg-brand-gold/15">
                  <Icon className="h-5 w-5 text-primary dark:text-brand-gold" />
                </div>
                <h3 className="mt-4 text-base font-semibold leading-snug">{area.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {area.description}
                </p>
                <p className="mt-4 rounded-xl bg-muted px-3 py-2 text-xs font-medium text-foreground">
                  {area.highlight}
                </p>
                <Link
                  href={area.href}
                  title={focusAreaTooltips[area.id] ?? "Learn more"}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold tracking-[0.08em] text-primary transition group-hover:gap-2 dark:text-brand-gold"
                >
                  अधिक माहिती
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
