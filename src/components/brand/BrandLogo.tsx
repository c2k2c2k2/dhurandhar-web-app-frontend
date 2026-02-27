import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  linkTitle?: string;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  title?: string;
  subtitle?: string;
  showText?: boolean;
  priority?: boolean;
};

export function BrandLogo({
  href,
  linkTitle = "Go to home page",
  className,
  imageClassName,
  textClassName,
  titleClassName,
  subtitleClassName,
  title = "Dhurandhar Sir",
  subtitle = "Career Point Academy",
  showText = true,
  priority = false,
}: BrandLogoProps) {
  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative h-10 w-10 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm",
          imageClassName
        )}
      >
        <Image
          src="/brand/logo.jpeg"
          alt="Dhurandhar logo"
          fill
          sizes="48px"
          className="object-cover"
          priority={priority}
        />
      </div>
      {showText ? (
        <div className={cn("leading-tight", textClassName)}>
          <p className={cn("text-sm font-semibold text-foreground", titleClassName)}>
            {title}
          </p>
          {subtitle ? (
            <p className={cn("text-xs text-muted-foreground", subtitleClassName)}>
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} aria-label="Dhurandhar home" title={linkTitle}>
      {content}
    </Link>
  );
}
