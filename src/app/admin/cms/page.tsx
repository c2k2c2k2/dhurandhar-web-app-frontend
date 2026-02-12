"use client";

import Link from "next/link";
import { RequirePerm } from "@/lib/auth/guards";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { CmsSubNav } from "@/modules/cms/components/CmsSubNav";

const CMS_CARDS = [
  {
    title: "Banners",
    description: "Top-of-home banners students see first.",
    href: "/admin/cms/banners",
  },
  {
    title: "Announcements",
    description: "Short updates shown to students and staff.",
    href: "/admin/cms/announcements",
  },
  {
    title: "Home Sections",
    description: "Reorder home screen sections and layouts.",
    href: "/admin/cms/home-sections",
  },
  {
    title: "Pages",
    description: "Static pages like About, Contact, Policies.",
    href: "/admin/cms/pages",
  },
];

export default function AdminCmsPage() {
  return (
    <RequirePerm perm="admin.config.write">
      <div className="space-y-6">
        <PageHeader
          title="CMS"
          description="Update what students see on the app home and info pages."
        />
        <CmsSubNav />
        <div className="grid gap-4 md:grid-cols-2">
          {CMS_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40"
            >
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </RequirePerm>
  );
}
