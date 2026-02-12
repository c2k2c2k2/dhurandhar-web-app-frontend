import { StudentGate } from "@/modules/student-shell/StudentGate";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentGate>{children}</StudentGate>;
}
