import { ExplainerView } from "@/features/learn/learn-view";

export default async function Page({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return <ExplainerView type={type} />;
}
