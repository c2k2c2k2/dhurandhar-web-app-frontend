import { apiFetch } from "@/lib/api/client";
import type { AccountProfile, UpdateMyProfilePayload } from "@/modules/account/types";

export async function getMyProfile() {
  return apiFetch<AccountProfile>("/users/me", { method: "GET" });
}

export async function updateMyProfile(payload: UpdateMyProfilePayload) {
  return apiFetch<AccountProfile>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
