"use client";

import type { WatermarkPayload } from "@/modules/student-notes/types";

function buildWatermarkText(payload: WatermarkPayload) {
  const contact = payload.maskedEmail ?? payload.maskedPhone ?? payload.email ?? payload.phone;
  const parts = [payload.displayName, contact, payload.userHash.slice(0, 6)].filter(Boolean);
  return parts.join(" • ");
}

export function WatermarkOverlay({ payload }: { payload?: WatermarkPayload }) {
  if (!payload) return null;
  const text = buildWatermarkText(payload);

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden rounded-[inherit]">
      <div className="absolute inset-0 bg-white/4" />
      <div
        className="absolute inset-0 opacity-[0.035] grayscale [filter:contrast(1.05)] [mix-blend-mode:multiply]"
        style={{
          backgroundImage: "url('/brand/logo.jpeg')",
          backgroundRepeat: "repeat",
          backgroundSize: "220px 220px",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 p-8 sm:p-10">
        <div className="grid h-full w-full content-evenly justify-items-center gap-12 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <span
              key={index}
              className="max-w-full whitespace-nowrap text-center text-[9px] font-medium tracking-[0.14em] text-black/18 [text-shadow:0_0_1px_rgba(255,255,255,0.95)] sm:text-[10px]"
              style={{
                transform: `rotate(${index % 2 === 0 ? -24 : -18}deg)`,
              }}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
