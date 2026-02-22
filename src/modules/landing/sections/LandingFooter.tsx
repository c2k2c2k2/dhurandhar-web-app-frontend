import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  footerNavLinks,
  footerPolicyLinks,
} from "@/modules/landing/content";

export function LandingFooter() {
  return (
    <footer id="contact" className="border-t border-border/60 bg-background">
      <PageContainer className="max-w-6xl">
        <div className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <BrandLogo href="/" />
            <p className="text-xs text-muted-foreground">
              Competitive exam prep for focused, results-driven students.
            </p>
            <Link
              href="/contact"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
            >
              Contact support
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {footerNavLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {footerPolicyLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
