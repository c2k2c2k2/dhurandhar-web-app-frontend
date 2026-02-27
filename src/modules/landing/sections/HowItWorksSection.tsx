import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { howItWorksSteps } from "@/modules/landing/content";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/35 py-14 md:py-18">
      <PageContainer className="max-w-6xl">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary dark:text-brand-gold">
            तयारीची सोपी पायरी
          </p>
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            सुरुवातीपासून सातत्यपूर्ण सरावापर्यंत, स्पष्ट मार्ग
          </h2>
        </div>

        <div className="relative mt-8">
          <div className="absolute left-6 right-6 top-7 hidden h-px bg-border md:block" />
          <div className="grid gap-6 md:grid-cols-3">
            {howItWorksSteps.map((step) => (
              <div
                key={step.step}
                className="relative rounded-3xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/5 text-sm font-semibold text-primary dark:border-brand-gold/45 dark:bg-brand-gold/15 dark:text-brand-gold">
                  {step.step}
                </div>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-start">
          <Button variant="cta" className="w-full sm:w-auto" asChild>
            <Link
              href="/auth/register?from=landing&plan=free"
              title="Start with a free account"
            >
              आजच सुरुवात करा
            </Link>
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}
