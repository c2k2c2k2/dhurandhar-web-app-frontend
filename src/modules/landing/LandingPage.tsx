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
          <div className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/8 blur-[130px] dark:bg-primary/18" />
          <div className="absolute right-[-120px] top-[240px] h-[380px] w-[380px] rounded-full bg-accent/8 blur-[140px] dark:bg-brand-gold/10" />
          <div className="absolute left-[-120px] top-[520px] h-[340px] w-[340px] rounded-full bg-brand-gold/12 blur-[130px] dark:bg-brand-gold/7" />
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
