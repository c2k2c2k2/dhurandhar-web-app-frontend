import { ForbiddenPanel } from "@/components/ForbiddenPanel";

export default function AdminForbiddenPage() {
  return (
    <ForbiddenPanel
      title="Permission denied"
      message="You do not have access to this section of the admin panel."
    />
  );
}
