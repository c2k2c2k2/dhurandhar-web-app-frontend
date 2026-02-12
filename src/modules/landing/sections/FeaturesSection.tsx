import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import { featureHighlights } from "@/modules/landing/content";

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 py-16 md:py-20">
      <PageContainer className="max-w-6xl">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Course Toolkit
          </p>
          <h2 className="font-display text-3xl font-semibold">
            Deep focus on the tools that move your score.
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Each module is built to keep preparation structured, measurable, and
            exam-ready.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {featureHighlights.map((feature, index) => (
            <FeatureSpotlight
              key={feature.title}
              feature={feature}
              isReversed={index % 2 === 1}
            />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

type FeatureSpotlightProps = {
  feature: (typeof featureHighlights)[number];
  isReversed?: boolean;
};

function FeatureSpotlight({ feature, isReversed }: FeatureSpotlightProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-8 rounded-3xl border border-border bg-card/70 p-6 shadow-sm lg:flex-row lg:items-center",
        isReversed && "lg:flex-row-reverse"
      )}
    >
      <div className="flex-1 space-y-4">
        <h3 className="text-2xl font-semibold">{feature.title}</h3>
        <p className="text-sm text-muted-foreground">
          {feature.description}
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {feature.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
      <FeaturePreview title={feature.title} />
    </div>
  );
}

function FeaturePreview({ title }: { title: string }) {
  return (
    <div className="flex-1">
      <div className="rounded-3xl border border-border bg-background/90 p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            Live preview
          </span>
        </div>
        <div className="mt-6 grid gap-3">
          {["Structured flow", "Quick revisions", "Score tracking"].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-primary/10 px-4 py-3 text-xs font-semibold text-primary">
          Updated weekly to match exam patterns
        </div>
      </div>
    </div>
  );
}
