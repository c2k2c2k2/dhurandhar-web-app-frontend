import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import { pricingFallbackPlans } from "@/modules/landing/content";
import type { PricingPlan } from "@/modules/landing/types";
import { buildAuthUrl } from "@/modules/shared/routing/returnUrl";

type PublicPlan = {
  id?: unknown;
  key?: unknown;
  name?: unknown;
  pricePaise?: unknown;
  durationDays?: unknown;
  featuresJson?: unknown;
  validity?: {
    label?: unknown;
    durationDays?: unknown;
  } | null;
  tier?: unknown;
};

const PRICING_REVALIDATE_SECONDS = 300;

export async function PricingSection() {
  const plans = await loadPricingPlans();

  return (
    <section id="pricing" className="scroll-mt-24 bg-muted/35 py-14 md:py-18">
      <PageContainer className="max-w-6xl">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary dark:text-brand-gold">
            किंमत आणि योजना
          </p>
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            स्पष्ट किंमत, स्पष्ट निर्णय
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            नवीन विद्यार्थ्यांना निर्णय घेणे सोपे व्हावे म्हणून योजना आणि किंमत
            एकाच ठिकाणी दिली आहे.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "relative flex h-full flex-col rounded-3xl border border-border bg-card p-5 shadow-sm",
                plan.isPopular && "border-primary/40 shadow-lg shadow-primary/10 dark:border-brand-gold/45"
              )}
            >
              {plan.isPopular ? (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground dark:bg-brand-gold dark:text-slate-950">
                  सर्वाधिक निवड
                </span>
              ) : null}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div>
                  <p className="text-2xl font-semibold">{plan.price}</p>
                  <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground">
                    {plan.interval}
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button variant={plan.isPopular ? "cta" : "outline"} className="w-full" asChild>
                  <Link href={plan.ctaHref} title={`Choose ${plan.name} plan`}>
                    {plan.ctaLabel}
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

async function loadPricingPlans(): Promise<PricingPlan[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!apiBaseUrl) {
    return pricingFallbackPlans;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/plans`, {
      method: "GET",
      next: { revalidate: PRICING_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return pricingFallbackPlans;
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) {
      return pricingFallbackPlans;
    }

    const mappedPlans = payload
      .map((item) => mapPublicPlanToPricingPlan(item as PublicPlan))
      .filter((item): item is PricingPlan => item !== null);

    if (!mappedPlans.length) {
      return pricingFallbackPlans;
    }

    const popularId = findPopularPlanId(mappedPlans);
    return mappedPlans.map((plan) => ({
      ...plan,
      isPopular: plan.id === popularId,
    }));
  } catch {
    return pricingFallbackPlans;
  }
}

function mapPublicPlanToPricingPlan(raw: PublicPlan): PricingPlan | null {
  const id = readString(raw.id);
  const name = readString(raw.name);
  const key = readString(raw.key);
  const pricePaise = readNumber(raw.pricePaise);
  const durationDays = readNumber(raw.durationDays);
  const tier = readString(raw.tier);

  if (!id || !name || pricePaise === null) {
    return null;
  }

  const features = normalizeFeatures(raw.featuresJson);
  const validityLabel = readString(raw.validity?.label);

  return {
    id,
    name,
    price: formatInr(pricePaise),
    interval: validityLabel ?? getDurationLabel(durationDays),
    features: features.length
      ? features
      : ["नोट्स, प्रश्नपत्रिका आणि सरावासाठी पूर्ण प्लॅटफॉर्म प्रवेश"],
    ctaLabel: pricePaise === 0 ? "मोफत सुरू करा" : "हा प्लॅन निवडा",
    ctaHref: buildAuthUrl("/auth/register", {
      from: "landing",
      plan: key ?? id,
    }),
    isPopular:
      Boolean(tier && tier.toLowerCase().includes("standard")) ||
      Boolean(key && key.toLowerCase().includes("standard")),
  };
}

function normalizeFeatures(features: unknown): string[] {
  if (Array.isArray(features)) {
    return features.map((item) => String(item).trim()).filter(Boolean).slice(0, 4);
  }

  if (features && typeof features === "object") {
    return Object.values(features as Record<string, unknown>)
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 4);
  }

  if (typeof features === "string" && features.trim()) {
    return [features.trim()];
  }

  return [];
}

function getDurationLabel(durationDays: number | null) {
  if (!durationDays || durationDays <= 0) {
    return "लवचिक वैधता";
  }

  if (durationDays === 30) {
    return "30 दिवस वैधता";
  }

  if (durationDays === 90) {
    return "3 महिने वैधता";
  }

  if (durationDays === 180) {
    return "6 महिने वैधता";
  }

  if (durationDays >= 360 && durationDays <= 370) {
    return "1 वर्ष वैधता";
  }

  return `${durationDays} दिवस वैधता`;
}

function findPopularPlanId(plans: PricingPlan[]) {
  const explicit = plans.find((plan) => plan.isPopular)?.id;
  if (explicit) {
    return explicit;
  }

  const firstPaidPlan = plans.find((plan) => extractPrice(plan.price) > 0)?.id;
  return firstPaidPlan ?? plans[0]?.id;
}

function extractPrice(value: string) {
  const numeric = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatInr(paise: number) {
  const rupees = paise / 100;
  return new Intl.NumberFormat("mr-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
