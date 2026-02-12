"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import type { Subject } from "@/modules/taxonomy/subjects/types";
import type { Topic } from "@/modules/taxonomy/topics/types";
import type { QuestionItem } from "../types";
import { extractText, truncateText } from "../utils";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(value?: string | null) {
  if (!value) return "-";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getSubjectName(subjectId: string, subjects: Subject[]) {
  const subject = subjects.find((item) => item.id === subjectId);
  return subject?.name || subject?.title || "Unknown";
}

function getTopicName(topicId: string | null | undefined, topics: Topic[]) {
  if (!topicId) return "-";
  const topic = topics.find((item) => item.id === topicId);
  return topic?.name || topic?.title || topicId;
}

export function QuestionsTable({
  questions,
  subjects,
  topics,
  canEdit,
  canPublish,
  onPublish,
  onUnpublish,
}: {
  questions: QuestionItem[];
  subjects: Subject[];
  topics: Topic[];
  canEdit: boolean;
  canPublish: boolean;
  onPublish: (questionId: string) => void;
  onUnpublish: (questionId: string) => void;
}) {
  const columns = React.useMemo<DataTableColumn<QuestionItem>[]>(
    () => [
      {
        key: "snippet",
        header: "Question",
        render: (question) => {
          const snippet = truncateText(extractText(question.statementJson), 140);
          return (
            <div className="space-y-1">
              <p className="font-medium">
                {canEdit ? (
                  <Link href={`/admin/questions/${question.id}`} className="hover:underline">
                    {snippet || "Untitled question"}
                  </Link>
                ) : (
                  snippet || "Untitled question"
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatLabel(question.type)}
              </p>
            </div>
          );
        },
      },
      {
        key: "subjectId",
        header: "Subject",
        render: (question) => getSubjectName(question.subjectId, subjects),
      },
      {
        key: "topicId",
        header: "Topic",
        render: (question) => getTopicName(question.topicId, topics),
      },
      {
        key: "difficulty",
        header: "Difficulty",
        render: (question) => formatLabel(question.difficulty),
      },
      {
        key: "published",
        header: "Published",
        render: (question) => (
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-medium",
              question.isPublished
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            )}
          >
            {question.isPublished ? "Published" : "Draft"}
          </span>
        ),
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (question) => formatDate(question.updatedAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (question) => (
          <div className="flex justify-end gap-2">
            {canEdit ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/questions/${question.id}`}>Edit</Link>
              </Button>
            ) : null}
            {canPublish ? (
              question.isPublished ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onUnpublish(question.id)}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPublish(question.id)}
                >
                  Publish
                </Button>
              )
            ) : null}
          </div>
        ),
      },
    ],
    [subjects, topics, canEdit, canPublish, onPublish, onUnpublish]
  );

  return (
    <DataTable
      columns={columns}
      rows={questions}
      emptyLabel="No questions found."
    />
  );
}
