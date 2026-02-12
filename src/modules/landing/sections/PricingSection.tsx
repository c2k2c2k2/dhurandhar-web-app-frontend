import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import { pricingPlans } from "@/modules/landing/content";

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-24 py-16 md:py-20 bg-muted/30">
      <PageContainer className="max-w-6xl">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Pricing
          </p>
          <h2 className="font-display text-3xl font-semibold">
            Simple, transparent pricing
          </h2>
          <p className="text-sm text-muted-foreground">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-sm",
                plan.isPopular && "relative border-accent/60 shadow-lg"
              )}
            >
              {plan.isPopular ? (
                <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  Most Popular
                </span>
              ) : null}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div>
                  <p className="text-3xl font-semibold">{plan.price}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {plan.interval}
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button
                  variant={plan.isPopular ? "cta" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
