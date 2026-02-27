import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { heroContent } from "@/modules/landing/content";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-12 pt-12 md:pb-16 md:pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-180px] h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
        <div className="absolute right-[-120px] top-[40px] h-[360px] w-[360px] rounded-full bg-accent/10 blur-[110px] dark:bg-brand-gold/10" />
      </div>
      <PageContainer className="max-w-6xl">
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <div
              className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-[0.1em] text-primary dark:border-brand-gold/40 dark:bg-brand-gold/15 dark:text-brand-gold motion-safe:animate-fade-up"
              style={{ animationDelay: "60ms" }}
            >
              {heroContent.badge}
            </div>
            <h1
              className="font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl motion-safe:animate-fade-up"
              style={{ animationDelay: "120ms" }}
            >
              {heroContent.headline}
            </h1>
            <p
              className="max-w-2xl text-sm leading-relaxed text-muted-foreground motion-safe:animate-fade-up md:text-base"
              style={{ animationDelay: "180ms" }}
            >
              {heroContent.subheadline}
            </p>
            <div
              className="flex flex-col gap-3 sm:flex-row sm:items-center motion-safe:animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <Button variant="cta" size="lg" className="w-full sm:w-auto" asChild>
                <Link
                  href={heroContent.primaryCtaHref}
                  title="Create your free account and start learning"
                >
                  {heroContent.primaryCtaLabel}
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href={heroContent.secondaryCtaHref} title="See pricing plans">
                  {heroContent.secondaryCtaLabel}
                </Link>
              </Button>
            </div>
            <div
              className="space-y-3 text-sm text-muted-foreground motion-safe:animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              <p className="font-medium text-foreground">{heroContent.trustLine}</p>
              <div className="flex flex-wrap gap-2">
                {heroContent.trustBullets.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-card/85 px-3 py-1 text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                href="/auth/login?from=landing"
                title="Log in to your existing account"
                className="inline-flex text-xs font-semibold tracking-[0.08em] text-muted-foreground transition hover:text-foreground"
              >
                आधीपासून अकाउंट आहे? लॉगिन करा
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
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/95 p-5 shadow-xl shadow-primary/10">
      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(8,49,103,0.12),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(253,218,21,0.12),_transparent_55%)]" />
      <div className="relative space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground">
              STUDY CONTROL PANEL
            </p>
            <p className="font-display text-xl font-semibold">आजचा अभ्यास फोकस</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-brand-gold/15 dark:text-brand-gold">
            संरचित योजना
          </span>
        </div>
        <div className="space-y-3">
          {[
            {
              title: "विषयानुसार अद्ययावत पुस्तके",
              subtitle: "परीक्षा पॅटर्ननुसार निवडक आणि सखोल कंटेंट.",
            },
            {
              title: "प्रश्नपत्रिका आणि टेस्ट सराव",
              subtitle: "टायमर-आधारित सराव आणि त्वरित निकाल.",
            },
            {
              title: "करिअर + मुलाखत मार्गदर्शन",
              subtitle: "तुमच्या लक्ष्याप्रमाणे स्पष्ट दिशादर्शन.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/70 bg-background/85 p-3.5 dark:bg-card/80"
            >
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-primary/[0.05] p-4 dark:bg-brand-gold/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">तयारी प्रगती</span>
            <span className="font-semibold text-primary dark:text-brand-gold">
              सातत्याने सुधारणा
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted">
            <div className="h-2 w-3/4 rounded-full bg-primary dark:bg-brand-gold" />
          </div>
        </div>
      </div>
    </div>
  );
}
