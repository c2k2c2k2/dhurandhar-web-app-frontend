import { PageContainer } from "@/components/layout/PageContainer";
import { trustLogos, trustSignals } from "@/modules/landing/content";

export function TrustSection() {
  return (
    <section className="py-16 md:py-20">
      <PageContainer className="max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Trust & credibility
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Built for serious preparation with security at the core.
            </h2>
            <p className="text-sm text-muted-foreground">
              We focus on secure access, clean delivery, and reliable support so
              students can study with confidence.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {trustSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                  <div
                    key={signal.title}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">
                      {signal.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {signal.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trustLogos.map((logo) => (
              <div
                key={logo}
                className="flex items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 px-6 py-10 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
