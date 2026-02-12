"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { RequirePerm } from "@/lib/auth/guards";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { QuestionEditor } from "@/modules/questions/components/QuestionEditor";

export default function AdminQuestionsNewPage() {
  const searchParams = useSearchParams();
  const initialSubjectId = searchParams.get("subjectId") || undefined;
  const initialTopicId = searchParams.get("topicId") || undefined;

  return (
    <RequirePerm perm="questions.crud">
      <div className="space-y-6">
        <PageHeader
          title="Create Question"
          description="Build a new question for the practice and test pools."
        />
        <QuestionEditor
          initialSubjectId={initialSubjectId}
          initialTopicId={initialTopicId}
        />
      </div>
    </RequirePerm>
  );
}
