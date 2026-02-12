import type { ExamFaq } from "@/modules/exams/types";

export function ExamFAQ({ faqs }: { faqs: ExamFaq[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((item) => (
        <details
          key={item.question}
          className="rounded-2xl border border-border bg-card px-4 py-3"
        >
          <summary className="cursor-pointer text-sm font-semibold">
            {item.question}
          </summary>
          <p className="mt-2 text-xs text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
