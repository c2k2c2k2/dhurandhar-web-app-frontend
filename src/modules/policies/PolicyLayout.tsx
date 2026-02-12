import { PageContainer } from "@/components/layout/PageContainer";
import { LandingFooter } from "@/modules/landing/sections/LandingFooter";
import { LandingHeader } from "@/modules/landing/sections/LandingHeader";

export function PolicyLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="py-14">
        <PageContainer className="max-w-4xl">
          <div className="space-y-4">
            <div>
              <h1 className="font-display text-3xl font-semibold">{title}</h1>
              {subtitle ? (
                <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="space-y-6 text-sm text-muted-foreground">
              {children}
            </div>
          </div>
        </PageContainer>
      </main>
      <LandingFooter />
    </div>
  );
}
