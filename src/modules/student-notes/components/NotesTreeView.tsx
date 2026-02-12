"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteTreeSubject, NoteTreeTopic } from "@/modules/student-notes/types";

function TopicNode({
  node,
  activeTopicId,
  onSelect,
  level,
}: {
  node: NoteTreeTopic;
  activeTopicId?: string;
  onSelect: (topicId: string) => void;
  level: number;
}) {
  const [open, setOpen] = React.useState(true);
  const hasChildren = (node.children ?? []).length > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl px-2 py-1 text-left text-sm",
          activeTopicId === node.id
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          <span
            className="flex items-center"
            onClick={(event) => {
              event.stopPropagation();
              setOpen((prev) => !prev);
            }}
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
        ) : (
          <span className="h-3.5 w-3.5" />
        )}
        <span>{node.name}</span>
        {node.notes?.length ? (
          <span className="ml-auto text-xs text-muted-foreground">
            {node.notes.length}
          </span>
        ) : null}
      </button>
      {open &&
        node.children?.map((child) => (
          <TopicNode
            key={child.id}
            node={child}
            activeTopicId={activeTopicId}
            onSelect={onSelect}
            level={level + 1}
          />
        ))}
    </div>
  );
}

export function NotesTreeView({
  subjects,
  activeSubjectId,
  activeTopicId,
  onSelectTopic,
}: {
  subjects: NoteTreeSubject[];
  activeSubjectId?: string;
  activeTopicId?: string;
  onSelectTopic: (topicId: string) => void;
}) {
  const subject =
    subjects.find((item) => item.id === activeSubjectId) ?? subjects[0];

  if (!subject) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        No topics loaded.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card/90 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {subject.name}
      </p>
      <div className="mt-3 space-y-1">
        {subject.topics.map((topic) => (
          <TopicNode
            key={topic.id}
            node={topic}
            activeTopicId={activeTopicId}
            onSelect={onSelectTopic}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
