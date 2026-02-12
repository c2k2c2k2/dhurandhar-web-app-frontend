import { useQuery } from "@tanstack/react-query";
import * as api from "@/modules/student-home/api";

export function useStudentHome() {
  return useQuery({
    queryKey: ["student", "home"],
    queryFn: api.getStudentHome,
  });
}
