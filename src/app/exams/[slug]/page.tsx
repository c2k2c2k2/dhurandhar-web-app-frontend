import { ExamDetailsPage } from "@/modules/exams/pages/ExamDetailsPage";

export default function ExamDetailsRoute({
  params,
}: {
  params: { slug: string };
}) {
  return <ExamDetailsPage slug={params.slug} />;
}
