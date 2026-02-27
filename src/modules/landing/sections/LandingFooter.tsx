import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  footerNavLinks,
  footerPolicyLinks,
} from "@/modules/landing/content";

const footerNavTooltips: Record<string, string> = {
  "#exams": "Go to study areas section",
  "#features": "Go to features section",
  "#pricing": "Go to pricing section",
  "#contact": "Go to contact section",
};

const policyTooltips: Record<string, string> = {
  "/privacy-policy": "Open privacy policy",
  "/terms": "Open terms and conditions",
  "/refund-policy": "Open refund policy",
};

export function LandingFooter() {
  return (
    <footer id="contact" className="border-t border-border/60 bg-background">
      <PageContainer className="max-w-6xl">
        <div className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <BrandLogo
              href="/"
              linkTitle="Go to Dhurandhar Academy home page"
              title="धुरंधर सर"
              subtitle="करिअर पॉईंट अकॅडमी"
              titleClassName="font-marathi-unicode text-sm font-bold"
              subtitleClassName="font-marathi-unicode text-xs"
            />
            <p className="text-xs text-muted-foreground">
              स्पर्धा परीक्षा तयारीसाठी स्वच्छ, मार्गदर्शित आणि परिणामकेंद्री
              प्लॅटफॉर्म.
            </p>
            <Link
              href="/contact"
              title="Open contact page"
              className="text-xs font-semibold tracking-[0.08em] text-muted-foreground transition hover:text-foreground"
            >
              संपर्क साधा
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {footerNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={footerNavTooltips[item.href] ?? "Navigate to section"}
                className="hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {footerPolicyLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={policyTooltips[item.href] ?? "Open policy page"}
                className="hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
