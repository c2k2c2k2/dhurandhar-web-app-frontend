"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Topic } from "./types";

const ROOT_KEY = "__root__";

function getTopicName(topic: Topic) {
  return topic.name || topic.title || "Untitled";
}

function buildTree(topics: Topic[]) {
  const map = new Map<string, Topic[]>();
  topics.forEach((topic) => {
    const parentKey = topic.parentId ?? ROOT_KEY;
    if (!map.has(parentKey)) {
      map.set(parentKey, []);
    }
    map.get(parentKey)?.push(topic);
  });
  map.forEach((items, key) => {
    items.sort((a, b) => {
      const orderA = a.orderIndex ?? 0;
      const orderB = b.orderIndex ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return getTopicName(a).localeCompare(getTopicName(b));
    });
    map.set(key, items);
  });
  return map;
}

export function TopicTree({
  topics,
  onEdit,
  onAddChild,
}: {
  topics: Topic[];
  onEdit: (topic: Topic) => void;
  onAddChild: (topic: Topic | null) => void;
}) {
  const tree = React.useMemo(() => buildTree(topics), [topics]);

  const renderNodes = (parentId: string | null, depth: number) => {
    const key = parentId ?? ROOT_KEY;
    const nodes = tree.get(key) || [];
    return nodes.map((topic) => {
      const active = topic.isActive ?? topic.active ?? true;
      return (
        <React.Fragment key={topic.id}>
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3"
            )}
            style={{ marginLeft: depth * 16 }}
          >
            <div>
              <p className="font-medium">{getTopicName(topic)}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>
                  {active ? "Active" : "Inactive"}
                </span>
                {topic.orderIndex !== null && topic.orderIndex !== undefined ? (
                  <span>Order {topic.orderIndex}</span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(topic)}>
                Edit
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onAddChild(topic)}>
                Add Child
              </Button>
            </div>
          </div>
          <div className="mt-3 space-y-3">
            {renderNodes(topic.id, depth + 1)}
          </div>
        </React.Fragment>
      );
    });
  };

  if (!topics.length) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        No topics found for this subject.
      </div>
    );
  }

  return <div className="space-y-3">{renderNodes(null, 0)}</div>;
}
