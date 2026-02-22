"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import { navItems } from "@/modules/landing/content";
import { buildAuthUrl } from "@/modules/shared/routing/returnUrl";

const primaryCta = {
  label: "Start Learning",
  href: buildAuthUrl("/auth/register", { from: "landing", plan: "free" }),
};

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition",
        isScrolled
          ? "border-b border-border/70 bg-background/95 shadow-sm backdrop-blur"
          : "bg-background/70 backdrop-blur"
      )}
    >
      <PageContainer className="max-w-6xl">
        <div className="flex items-center justify-between py-4">
          <BrandLogo
            href="/"
            imageClassName="h-11 w-11"
            priority
          />

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={buildAuthUrl("/auth/login", { from: "landing" })}
              className="text-foreground transition hover:text-primary"
            >
              Login
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="cta" size="sm" asChild>
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </PageContainer>

      {menuOpen ? (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur" onClick={() => setMenuOpen(false)} />
          <div
            id="landing-mobile-menu"
            className="fixed inset-x-4 top-20 z-50 rounded-3xl border border-border bg-background p-6 shadow-lg"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={buildAuthUrl("/auth/login", { from: "landing" })}
                className="text-sm font-medium text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Button variant="cta" asChild>
                <Link href={primaryCta.href} onClick={() => setMenuOpen(false)}>
                  {primaryCta.label}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
