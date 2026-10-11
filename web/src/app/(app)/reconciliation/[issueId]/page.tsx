import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ issueId: string }> }) {
  const { issueId } = await params;
  redirect(`/reconciliation?issue=${issueId}`);
}
