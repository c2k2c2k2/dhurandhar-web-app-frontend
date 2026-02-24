"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "dhurandhar.legacyMarathiInputMode";
const ROOT_ATTR = "data-legacy-marathi-inputs";

function applyLegacyMode(enabled: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  if (enabled) {
    document.documentElement.setAttribute(ROOT_ATTR, "true");
  } else {
    document.documentElement.removeAttribute(ROOT_ATTR);
  }
}

export function LegacyMarathiInputModeSwitch() {
  const [enabled, setEnabled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const nextEnabled = stored === "1";
    setEnabled(nextEnabled);
    applyLegacyMode(nextEnabled);
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) {
      return;
    }
    applyLegacyMode(enabled);
    window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  }, [enabled, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-1">
      <Button
        type="button"
        size="sm"
        variant={enabled ? "primary" : "outline"}
        className="rounded-full px-3 shadow-lg"
        onClick={() => setEnabled((current) => !current)}
      >
        <Languages className="h-4 w-4" />
        Legacy Marathi: {enabled ? "On" : "Off"}
      </Button>
      <p className="rounded-full bg-background/90 px-2 py-1 text-[11px] text-muted-foreground shadow">
        Shree-Dev typing mode for text fields
      </p>
    </div>
  );
}
