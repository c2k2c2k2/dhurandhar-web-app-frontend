import { PageContainer } from "@/components/layout/PageContainer";
import { testimonials, trustSignals } from "@/modules/landing/content";

export function TrustSection() {
  return (
    <section className="py-14 md:py-18">
      <PageContainer className="max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-primary dark:text-brand-gold">
              विश्वास आणि विश्वसनीयता
            </p>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              मार्गदर्शनात गुणवत्ता, प्लॅटफॉर्ममध्ये विश्वास
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              अकॅडमीचा अनुभव विद्यार्थ्यांसाठी सुरक्षित, स्पष्ट आणि सातत्यपूर्ण
              राहावा यासाठी प्रत्येक स्तरावर विश्वासार्ह पद्धती वापरल्या जातात.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {trustSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                  <div
                    key={signal.title}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 dark:bg-brand-gold/15">
                      <Icon className="h-5 w-5 text-primary dark:text-brand-gold" />
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

          <div className="grid gap-4">
            {testimonials.map((item) => (
              <div
                key={item.quote}
                className="rounded-3xl border border-border bg-muted/35 p-4"
              >
                <p className="text-sm leading-relaxed text-foreground">
                  &quot;{item.quote}&quot;
                </p>
                <div className="mt-3 border-t border-border/70 pt-3">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
