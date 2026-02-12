import { FinalCtaSection } from "@/modules/landing/sections/FinalCtaSection";
import { FeaturesSection } from "@/modules/landing/sections/FeaturesSection";
import { HeroSection } from "@/modules/landing/sections/HeroSection";
import { HowItWorksSection } from "@/modules/landing/sections/HowItWorksSection";
import { LandingFooter } from "@/modules/landing/sections/LandingFooter";
import { LandingHeader } from "@/modules/landing/sections/LandingHeader";
import { PricingSection } from "@/modules/landing/sections/PricingSection";
import { TrustSection } from "@/modules/landing/sections/TrustSection";
import { UspSection } from "@/modules/landing/sections/UspSection";
import { ExamsSection } from "@/modules/landing/sections/ExamsSection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
          <div className="absolute right-[-120px] top-[160px] h-[420px] w-[420px] rounded-full bg-accent/10 blur-[160px]" />
          <div className="absolute left-[-140px] top-[560px] h-[360px] w-[360px] rounded-full bg-brand-gold/10 blur-[140px]" />
        </div>

        <LandingHeader />
        <main>
          <HeroSection />
          <ExamsSection />
          <UspSection />
          <HowItWorksSection />
          <FeaturesSection />
          <PricingSection />
          <TrustSection />
          <FinalCtaSection />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
