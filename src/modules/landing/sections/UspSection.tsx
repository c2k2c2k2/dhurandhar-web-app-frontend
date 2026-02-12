import { PageContainer } from "@/components/layout/PageContainer";
import { uspItems } from "@/modules/landing/content";

export function UspSection() {
  return (
    <section id="about" className="scroll-mt-24 py-16 md:py-20">
      <PageContainer className="max-w-6xl">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Why Dhurandhar
          </p>
          <h2 className="font-display text-3xl font-semibold">
            Designed for focused preparation - content, practice, and progress in
            one place.
          </h2>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {uspItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
