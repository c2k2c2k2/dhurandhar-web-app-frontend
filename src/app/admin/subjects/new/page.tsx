import { RequirePerm } from "@/lib/auth/guards";
import { AdminPlaceholder } from "@/modules/admin-shell/AdminPlaceholder";

export default function AdminSubjectsNewPage() {
  return (
    <RequirePerm perm="content.manage">
      <AdminPlaceholder
        title="Create Subject"
        description="Set up a new subject for the taxonomy."
        actionLabel="Back to Taxonomy"
        actionHref="/admin/taxonomy"
      />
    </RequirePerm>
  );
}
