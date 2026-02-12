import { LandingFooter } from "@/modules/landing/sections/LandingFooter";
import { LandingHeader } from "@/modules/landing/sections/LandingHeader";
import { ExamsSection } from "@/modules/landing/sections/ExamsSection";

export default function ExamsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>
        <ExamsSection />
      </main>
      <LandingFooter />
    </div>
  );
}
