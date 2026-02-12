import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { heroContent } from "@/modules/landing/content";

export function HeroSection() {
  return (
    <section className="relative pt-16 md:pt-24">
      <PageContainer className="max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground motion-safe:animate-fade-up"
              style={{ animationDelay: "60ms" }}
            >
              Focused exam preparation
            </div>
            <h1
              className="font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl motion-safe:animate-fade-up"
              style={{ animationDelay: "120ms" }}
            >
              {heroContent.headline}
            </h1>
            <p
              className="max-w-xl text-base text-muted-foreground motion-safe:animate-fade-up"
              style={{ animationDelay: "180ms" }}
            >
              {heroContent.subheadline}
            </p>
            <div
              className="flex flex-col gap-3 sm:flex-row sm:items-center motion-safe:animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <Button variant="cta" size="lg" className="w-full sm:w-auto" asChild>
                <Link href={heroContent.primaryCtaHref}>
                  {heroContent.primaryCtaLabel}
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href={heroContent.secondaryCtaHref}>
                  {heroContent.secondaryCtaLabel}
                </Link>
              </Button>
            </div>
            <div
              className="space-y-3 text-sm text-muted-foreground motion-safe:animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              <p className="font-medium text-foreground">
                {heroContent.trustLine}
              </p>
              <div className="flex flex-wrap gap-2">
                {heroContent.trustBullets.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                href="/auth/login?from=landing"
                className="inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
              >
                Already have an account? Login
              </Link>
            </div>
          </div>

          <div className="relative">
            <ProductPreviewCard />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

function ProductPreviewCard() {
  return (
    <div className="relative rounded-3xl border border-border bg-card/90 p-6 shadow-xl shadow-primary/5">
      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(227,27,76,0.12),_transparent_55%)]" />
      <div className="relative space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Student Dashboard
            </p>
            <p className="font-display text-2xl font-semibold">
              Today&apos;s Focus
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Premium
          </span>
        </div>
        <div className="space-y-3">
          {[
            {
              title: "Quantitative Aptitude - 45 mins",
              subtitle: "Topic-wise MCQs aligned to SSC + Banking patterns.",
            },
            {
              title: "Subject Test - 45 mins",
              subtitle: "Timed subject test with instant review insights.",
            },
            {
              title: "Full-length Mock",
              subtitle: "Complete test to build speed and stamina.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/70 bg-muted/50 p-4"
            >
              <p className="text-sm font-medium text-foreground">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-background/80 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Focus score</span>
            <span className="font-semibold text-primary">87%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted">
            <div className="h-2 w-4/5 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
