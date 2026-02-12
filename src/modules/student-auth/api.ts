import { apiFetch } from "@/lib/api/client";
import type { StudentMe } from "@/modules/student-auth/types";

export async function getStudentMe() {
  return apiFetch<StudentMe>("/users/me", { method: "GET" });
}

export async function updateStudentMe(payload: {
  fullName?: string;
  phone?: string;
}) {
  return apiFetch<StudentMe>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
