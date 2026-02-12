"use client";

import { RequirePerm } from "@/lib/auth/guards";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { TestEditor } from "@/modules/tests/components/TestEditor";

export default function AdminTestsNewPage() {
  return (
    <RequirePerm perm="tests.crud">
      <div className="space-y-6">
        <PageHeader
          title="Create Test"
          description="Draft a new test series for student attempts."
        />
        <TestEditor />
      </div>
    </RequirePerm>
  );
}
