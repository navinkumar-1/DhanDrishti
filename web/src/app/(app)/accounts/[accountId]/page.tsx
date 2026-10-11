import { AccountDetailView } from "@/features/accounts/accounts-view";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return <AccountDetailView accountId={accountId} />;
}
