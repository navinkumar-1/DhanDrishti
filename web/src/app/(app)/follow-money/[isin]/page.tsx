import { FollowMoneyView } from "@/features/follow-money/follow-money-view";

export default async function Page({ params }: { params: Promise<{ isin: string }> }) {
  const { isin } = await params;
  return <FollowMoneyView isin={isin} />;
}
