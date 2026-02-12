import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { howItWorksSteps } from "@/modules/landing/content";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-muted/30">
      <PageContainer className="max-w-6xl">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </p>
          <h2 className="font-display text-3xl font-semibold">
            Start in minutes. Improve with daily practice.
          </h2>
        </div>

        <div className="relative mt-10">
          <div className="hidden md:block absolute left-6 right-6 top-7 h-px bg-border" />
          <div className="grid gap-6 md:grid-cols-3">
            {howItWorksSteps.map((step) => (
              <div
                key={step.step}
                className="relative rounded-3xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
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
            <Link href="/auth/register?from=landing&plan=free">Start Learning</Link>
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}
