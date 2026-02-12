import { RequirePerm } from "@/lib/auth/guards";
import { AdminPlaceholder } from "@/modules/admin-shell/AdminPlaceholder";

export default function AdminTopicsNewPage() {
  return (
    <RequirePerm perm="content.manage">
      <AdminPlaceholder
        title="Create Topic"
        description="Add a new topic within a subject."
        actionLabel="Back to Taxonomy"
        actionHref="/admin/taxonomy"
      />
    </RequirePerm>
  );
}
