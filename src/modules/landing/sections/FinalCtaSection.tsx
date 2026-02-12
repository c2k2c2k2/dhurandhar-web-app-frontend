import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";

export function FinalCtaSection() {
  return (
    <section className="py-16 md:py-20">
      <PageContainer className="max-w-6xl">
        <div className="rounded-3xl bg-primary px-8 py-10 text-primary-foreground shadow-lg shadow-primary/20 md:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
                Start your preparation today
              </p>
              <h2 className="font-display text-3xl font-semibold">
                Turn focused study into confident performance.
              </h2>
              <p className="max-w-xl text-sm text-primary-foreground/80">
                Create your free account, pick an exam, and begin with structured
                notes and practice sets.
              </p>
            </div>
            <Button variant="cta" size="lg" className="w-full md:w-auto" asChild>
              <Link href="/auth/register?from=landing&plan=free">
                Create Free Account
              </Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
