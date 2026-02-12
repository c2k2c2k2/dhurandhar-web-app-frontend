"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RequirePerm } from "@/lib/auth/guards";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hasPermission } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormSelect } from "@/modules/shared/components/FormField";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import { useTopics } from "@/modules/taxonomy/topics/hooks";
import { QuestionsTable } from "@/modules/questions/components/QuestionsTable";
import {
  usePublishQuestion,
  useQuestions,
  useUnpublishQuestion,
} from "@/modules/questions/hooks";
import { extractText } from "@/modules/questions/utils";

export default function AdminQuestionsPage() {
  const { user } = useAuth();
  const canEdit = hasPermission(user, "questions.crud");
  const canPublish = hasPermission(user, "questions.publish");

  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId") || "";
  const topicId = searchParams.get("topicId") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const published = searchParams.get("published") || "all";
  const searchParam = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = React.useState(searchParam);
  React.useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const updateQuery = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const queryString = params.toString();
      router.replace(`/admin/questions${queryString ? `?${queryString}` : ""}`);
    },
    [router, searchParams]
  );

  React.useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed.length < 2) {
      if (searchParam) {
        updateQuery({ q: null });
      }
      return;
    }
    if (trimmed !== searchParam) {
      updateQuery({ q: trimmed });
    }
  }, [debouncedSearch, searchParam, updateQuery]);

  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { data: topics } = useTopics(subjectId || undefined);

  const filters = React.useMemo(
    () => ({
      subjectId: subjectId || undefined,
      topicId: topicId || undefined,
      difficulty:
        difficulty === "EASY" || difficulty === "MEDIUM" || difficulty === "HARD"
          ? (difficulty as "EASY" | "MEDIUM" | "HARD")
          : undefined,
      isPublished: published === "all" ? undefined : published === "yes",
    }),
    [subjectId, topicId, difficulty, published]
  );

  const {
    data: questions,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuestions(filters);

  const publishQuestion = usePublishQuestion();
  const unpublishQuestion = useUnpublishQuestion();

  const searchTerm = searchParam.trim().toLowerCase();
  const filteredQuestions = React.useMemo(() => {
    if (!questions) return [];
    if (searchTerm.length < 2) return questions;
    return questions.filter((question) =>
      extractText(question.statementJson).toLowerCase().includes(searchTerm)
    );
  }, [questions, searchTerm]);

  return (
    <RequirePerm perm="questions.read">
      <div className="space-y-6">
        <PageHeader
          title="Questions"
          description="Manage question bank entries."
          actions={
            canEdit ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" asChild>
                  <Link href="/admin/questions/import">Bulk Import</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/admin/questions/new">Create Question</Link>
                </Button>
              </div>
            ) : null
          }
        />

        <FiltersBar
          filters={
            <div className="flex flex-wrap gap-2">
              <FormSelect
                label="Subject"
                value={subjectId}
                onChange={(event) => {
                  updateQuery({ subjectId: event.target.value || null, topicId: null });
                }}
              >
                <option value="">All subjects</option>
                {(subjects || []).map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name || subject.title || "Untitled"}
                  </option>
                ))}
              </FormSelect>
              <FormSelect
                label="Topic"
                value={topicId}
                onChange={(event) => updateQuery({ topicId: event.target.value || null })}
                disabled={!subjectId}
              >
                <option value="">All topics</option>
                {(topics || []).map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name || topic.title || "Untitled"}
                  </option>
                ))}
              </FormSelect>
              <FormSelect
                label="Difficulty"
                value={difficulty}
                onChange={(event) =>
                  updateQuery({ difficulty: event.target.value || null })
                }
              >
                <option value="">All</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </FormSelect>
              <FormSelect
                label="Published"
                value={published}
                onChange={(event) => updateQuery({ published: event.target.value || null })}
              >
                <option value="all">All</option>
                <option value="yes">Published</option>
                <option value="no">Draft</option>
              </FormSelect>
              <FormField label="Search">
                <Input
                  placeholder="Search questions..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </FormField>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  router.replace("/admin/questions");
                }}
              >
                Reset
              </Button>
            </div>
          }
        />

        {subjectsLoading || questionsLoading ? (
          <LoadingState label="Loading questions..." />
        ) : questionsError ? (
          <ErrorState
            description={
              questionsError &&
              typeof questionsError === "object" &&
              "message" in questionsError
                ? String(questionsError.message)
                : "Unable to load questions."
            }
          />
        ) : (
          <QuestionsTable
            questions={filteredQuestions}
            subjects={subjects || []}
            topics={topics || []}
            canEdit={canEdit}
            canPublish={canPublish}
            onPublish={(questionId) => publishQuestion.mutate(questionId)}
            onUnpublish={(questionId) => unpublishQuestion.mutate(questionId)}
          />
        )}
      </div>
    </RequirePerm>
  );
}
