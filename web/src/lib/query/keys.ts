export const qk = {
  summary: ["summary"] as const,
  holdings: ["holdings"] as const,
  holding: (isin: string) => ["holding", isin] as const,
  accounts: ["accounts"] as const,
  issues: ["issues"] as const,
  concentration: (view: string) => ["concentration", view] as const,
  connections: ["connections"] as const,
  education: ["education"] as const,
  risks: ["risks"] as const,
  cashflows: ["cashflows"] as const,
  brokers: ["brokers"] as const,
};
