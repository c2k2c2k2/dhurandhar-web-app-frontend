"use client";

import type { WatermarkPayload } from "@/modules/student-notes/types";

function buildWatermarkText(payload: WatermarkPayload) {
  const email = payload.email ?? payload.maskedEmail;
  const phone = payload.phone ?? payload.maskedPhone;
  const parts = [
    payload.displayName,
    email,
    phone,
    payload.userHash.slice(0, 10),
  ].filter(Boolean);
  return parts.join(" • ");
}

export function WatermarkOverlay({ payload }: { payload?: WatermarkPayload }) {
  if (!payload) return null;
  const text = buildWatermarkText(payload);

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08] grayscale [filter:contrast(1.2)] [mix-blend-mode:multiply]"
        style={{
          backgroundImage: "url('/brand/logo.jpeg')",
          backgroundRepeat: "repeat",
          backgroundSize: "140px 140px",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute inset-[-24%] -rotate-[23deg] [mix-blend-mode:multiply]">
        <div className="grid h-full w-full grid-cols-2 gap-x-10 gap-y-20 md:grid-cols-3">
          {Array.from({ length: 42 }).map((_, index) => (
            <span
              key={index}
              className="whitespace-nowrap text-center text-[10px] font-semibold tracking-[0.18em] text-black/35 [text-shadow:0_0_1px_rgba(255,255,255,0.65)] md:text-sm"
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
