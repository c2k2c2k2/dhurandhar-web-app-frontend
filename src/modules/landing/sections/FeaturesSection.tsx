import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import { featureHighlights } from "@/modules/landing/content";

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 py-14 md:py-18">
      <PageContainer className="max-w-6xl">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary dark:text-brand-gold">
            डिजिटल अभ्यास प्लॅटफॉर्म
          </p>
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            जिथे तयारी मोजता येते, सुधारता येते आणि टिकवता येते
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            प्रत्येक मॉड्यूल प्रत्यक्ष तयारीसाठी: कमी गोंधळ, जास्त अंमलबजावणी.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {featureHighlights.map((feature) => (
            <FeatureSpotlight key={feature.title} feature={feature} />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

type FeatureSpotlightProps = {
  feature: (typeof featureHighlights)[number];
};

function FeatureSpotlight({ feature }: FeatureSpotlightProps) {
  const toneClasses = getToneClasses(feature.tone);
  return (
    <div
      className={cn(
        "h-full rounded-3xl border p-5 shadow-sm",
        toneClasses.wrapper
      )}
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-foreground/80">
          {feature.description}
        </p>
        <ul className="space-y-2 text-sm text-foreground/80">
          {feature.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2">
              <span className={cn("mt-1 h-1.5 w-1.5 rounded-full", toneClasses.dot)} />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function getToneClasses(tone: (typeof featureHighlights)[number]["tone"]) {
  if (tone === "gold") {
    return {
      wrapper:
        "border-brand-gold/35 bg-brand-gold/10 dark:border-brand-gold/45 dark:bg-[linear-gradient(180deg,rgba(253,218,21,0.14),rgba(12,17,26,0.92))]",
      dot: "bg-brand-gold",
    };
  }

  if (tone === "crimson") {
    return {
      wrapper:
        "border-accent/35 bg-accent/5 dark:border-accent/45 dark:bg-[linear-gradient(180deg,rgba(227,27,76,0.18),rgba(12,17,26,0.92))]",
      dot: "bg-accent",
    };
  }

  return {
    wrapper:
      "border-primary/35 bg-primary/[0.06] dark:border-primary/45 dark:bg-[linear-gradient(180deg,rgba(27,59,105,0.25),rgba(12,17,26,0.92))]",
    dot: "bg-primary dark:bg-brand-gold",
  };
}
