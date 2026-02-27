import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";

export function FinalCtaSection() {
  return (
    <section className="py-14 md:py-18">
      <PageContainer className="max-w-6xl">
        <div className="rounded-3xl bg-[linear-gradient(135deg,rgb(var(--primary)),rgb(var(--brand-navy-2)))] px-7 py-8 text-primary-foreground shadow-lg shadow-primary/20 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary-foreground/80">
                तुमच्या तयारीला आजच योग्य दिशा द्या
              </p>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                धुरंधर सर अकॅडमीसोबत अभ्यास, सराव आणि यशाचा पुढचा टप्पा सुरू करा
              </h2>
              <p className="max-w-xl text-sm text-primary-foreground/85">
                मोफत नोंदणी करून अभ्यास साहित्य, प्रश्नपत्रिका आणि करिअर
                मार्गदर्शनासह तयारी लगेच सुरू करा.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <Button variant="cta" size="lg" className="w-full md:w-auto" asChild>
                <Link
                  href="/auth/register?from=landing&plan=free"
                  title="Create your free account"
                >
                  मोफत नोंदणी
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 md:w-auto"
                asChild
              >
                <Link href="/contact" title="Contact us for guidance">
                  सल्ला घ्या
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
