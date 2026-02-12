"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RequirePerm } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { FormSelect } from "@/modules/shared/components/FormField";
import { Input } from "@/components/ui/input";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { TaxonomyTabs } from "@/modules/taxonomy/components/TaxonomyTabs";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import type { Subject } from "@/modules/taxonomy/subjects/types";
import { useTopics } from "@/modules/taxonomy/topics/hooks";
import type { Topic } from "@/modules/taxonomy/topics/types";
import { TopicFormDialog } from "@/modules/taxonomy/topics/TopicFormDialog";
import { TopicTree } from "@/modules/taxonomy/topics/TopicTree";

function getSubjectName(subject: Subject) {
  return subject.name || subject.title || "Untitled";
}

function getTopicName(topic: Topic) {
  return topic.name || topic.title || "";
}

export default function AdminTopicsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectIdParam = searchParams.get("subjectId") || "";
  const shouldCreate = searchParams.get("create") === "1";

  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } =
    useSubjects();

  const selectedSubjectId =
    subjectIdParam || (subjects && subjects[0] ? subjects[0].id : "");

  React.useEffect(() => {
    if (!subjectIdParam && subjects && subjects[0]?.id) {
      router.replace(`/admin/taxonomy/topics?subjectId=${subjects[0].id}`);
    }
  }, [subjectIdParam, subjects, router]);

  const {
    data: topics,
    isLoading: topicsLoading,
    error: topicsError,
  } = useTopics(selectedSubjectId);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Topic | null>(null);
  const [defaultParent, setDefaultParent] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (shouldCreate) {
      setEditing(null);
      setDefaultParent(null);
      setOpen(true);
    }
  }, [shouldCreate]);

  const closeDialog = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && shouldCreate && selectedSubjectId) {
      router.replace(`/admin/taxonomy/topics?subjectId=${selectedSubjectId}`);
    }
  };

  const filteredTopics =
    topics?.filter((topic) =>
      getTopicName(topic).toLowerCase().includes(query.toLowerCase())
    ) || [];

  return (
    <RequirePerm perm="content.manage">
      <div className="space-y-6">
        <PageHeader
          title="Topics"
          description="Organize topics under subjects."
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setEditing(null);
                setDefaultParent(null);
                setOpen(true);
              }}
              disabled={!selectedSubjectId}
            >
              Create Topic
            </Button>
          }
        />
        <TaxonomyTabs />
        <FiltersBar
          filters={
            <div className="flex flex-wrap gap-2">
              <FormSelect
                label="Subject"
                value={selectedSubjectId}
                onChange={(event) => {
                  const nextSubject = event.target.value;
                  router.replace(
                    `/admin/taxonomy/topics?subjectId=${nextSubject}`
                  );
                }}
              >
                {(subjects || []).map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {getSubjectName(subject)}
                  </option>
                ))}
              </FormSelect>
              <Input
                className="w-64"
                placeholder="Search topics..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          }
        />
        {subjectsLoading ? (
          <LoadingState label="Loading subjects..." />
        ) : subjectsError ? (
          <ErrorState
            description={
              subjectsError &&
              typeof subjectsError === "object" &&
              "message" in subjectsError
                ? String(subjectsError.message)
                : "Unable to load subjects."
            }
          />
        ) : topicsLoading ? (
          <LoadingState label="Loading topics..." />
        ) : topicsError ? (
          <ErrorState
            description={
              topicsError && typeof topicsError === "object" && "message" in topicsError
                ? String(topicsError.message)
                : "Unable to load topics."
            }
          />
        ) : (
          <TopicTree
            topics={filteredTopics}
            onEdit={(topic) => {
              setEditing(topic);
              setDefaultParent(topic.parentId ?? null);
              setOpen(true);
            }}
            onAddChild={(topic) => {
              setEditing(null);
              setDefaultParent(topic?.id ?? null);
              setOpen(true);
            }}
          />
        )}
        {selectedSubjectId ? (
          <TopicFormDialog
            open={open}
            onOpenChange={closeDialog}
            subjectId={selectedSubjectId}
            topics={topics || []}
            topic={editing}
            defaultParentId={defaultParent}
          />
        ) : null}
      </div>
    </RequirePerm>
  );
}
