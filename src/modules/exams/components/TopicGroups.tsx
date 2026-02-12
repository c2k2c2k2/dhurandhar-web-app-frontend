import type { ExamTopicGroup } from "@/modules/exams/types";

export function TopicGroups({ groups }: { groups: ExamTopicGroup[] }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.title}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <h3 className="text-sm font-semibold">{group.title}</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {group.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-border bg-muted/40 px-3 py-1"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
