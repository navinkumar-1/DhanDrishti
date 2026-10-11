import { HoldingDetailView } from "@/features/portfolio/holding-detail-view";

export default async function Page({ params }: { params: Promise<{ isin: string }> }) {
  const { isin } = await params;
  return <HoldingDetailView isin={isin} />;
}
