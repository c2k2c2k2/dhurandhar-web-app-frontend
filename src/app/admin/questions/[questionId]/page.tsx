"use client";

import { useParams } from "next/navigation";
import { RequirePerm } from "@/lib/auth/guards";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState } from "@/modules/shared/components/States";
import { QuestionEditor } from "@/modules/questions/components/QuestionEditor";

export default function AdminQuestionDetailPage() {
  const params = useParams<{ questionId: string | string[] }>();
  const questionId = Array.isArray(params.questionId)
    ? params.questionId[0]
    : params.questionId;

  if (!questionId) {
    return <ErrorState description="Question ID is missing." />;
  }

  return (
    <RequirePerm perm="questions.crud">
      <div className="space-y-6">
        <PageHeader
          title="Edit Question"
          description="Update statement, options, and explanation."
        />
        <QuestionEditor questionId={questionId} />
      </div>
    </RequirePerm>
  );
}
