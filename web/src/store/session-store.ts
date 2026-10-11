"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Source = "sample" | "upload" | "broker" | null;

interface SessionState {
  hasData: boolean;
  source: Source;
  brokerName: string | null;
  hydrated: boolean;
  ownerUid: string | null;
  reviewedIssueIds: string[];
  bindOwner: (uid: string) => void;
  loadSample: () => void;
  loadUpload: () => void;
  loadBroker: (name: string) => void;
  markReviewed: (id: string) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      hasData: false,
      source: null,
      brokerName: null,
      hydrated: false,
      ownerUid: null,
      reviewedIssueIds: [],
      bindOwner: (uid) => set({ ownerUid: uid }),
      loadSample: () => set({ hasData: true, source: "sample", brokerName: null }),
      loadUpload: () => set({ hasData: true, source: "upload", brokerName: null }),
      loadBroker: (name) => set({ hasData: true, source: "broker", brokerName: name }),
      markReviewed: (id) =>
        set((state) => ({
          reviewedIssueIds: state.reviewedIssueIds.includes(id)
            ? state.reviewedIssueIds
            : [...state.reviewedIssueIds, id],
        })),
      clear: () => set({ hasData: false, source: null, brokerName: null, ownerUid: null, reviewedIssueIds: [] }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "dhandrishti-session",
      partialize: (state) => ({
        hasData: state.hasData,
        source: state.source,
        brokerName: state.brokerName,
        ownerUid: state.ownerUid,
        reviewedIssueIds: state.reviewedIssueIds,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
