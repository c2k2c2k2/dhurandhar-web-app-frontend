import { useQuery } from "@tanstack/react-query";
import * as api from "@/modules/student-auth/api";

export function useStudentMe(enabled = true) {
  return useQuery({
    queryKey: ["student", "me"],
    queryFn: api.getStudentMe,
    enabled,
  });
}
