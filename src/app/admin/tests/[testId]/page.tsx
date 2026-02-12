"use client";

import { useParams } from "next/navigation";
import { RequirePerm } from "@/lib/auth/guards";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState } from "@/modules/shared/components/States";
import { TestEditor } from "@/modules/tests/components/TestEditor";

export default function AdminTestDetailPage() {
  const params = useParams<{ testId: string | string[] }>();
  const testId = Array.isArray(params.testId) ? params.testId[0] : params.testId;

  if (!testId) {
    return <ErrorState description="Test ID is missing." />;
  }

  return (
    <RequirePerm perm="tests.crud">
      <div className="space-y-6">
        <PageHeader
          title="Edit Test"
          description="Update schedule, mix rules, and publishing."
        />
        <TestEditor testId={testId} />
      </div>
    </RequirePerm>
  );
}
