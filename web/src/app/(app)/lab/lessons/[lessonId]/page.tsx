import { LessonView } from "@/features/lab/lab-view";

export default async function Page({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <LessonView lessonId={lessonId} />;
}
