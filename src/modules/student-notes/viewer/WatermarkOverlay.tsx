"use client";

import type { WatermarkPayload } from "@/modules/student-notes/types";

function buildWatermarkText(payload: WatermarkPayload) {
  const parts = [
    payload.displayName,
    payload.maskedEmail,
    payload.maskedPhone,
    payload.userHash.slice(0, 8),
  ].filter(Boolean);
  return parts.join(" • ");
}

export function WatermarkOverlay({ payload }: { payload?: WatermarkPayload }) {
  if (!payload) return null;
  const text = buildWatermarkText(payload);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
        <div className="grid w-full -rotate-12 grid-cols-2 gap-8 text-center text-xs font-semibold uppercase tracking-[0.3em] text-foreground/70">
          {Array.from({ length: 10 }).map((_, index) => (
            <span key={index} className="whitespace-nowrap">
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
