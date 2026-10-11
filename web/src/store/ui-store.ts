"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "@/types/domain";

export interface SourceDrawerModel {
  title: string;
  valueLabel: string;
  asOf: string;
  sourceLabel: string;
  note?: string;
  href?: string;
  hrefLabel?: string;
}

interface UiState {
  language: Lang;
  privacy: boolean;
  source: SourceDrawerModel | null;
  evidenceIsin: string | null;
  assistantOpen: boolean;
  setLanguage: (language: Lang) => void;
  togglePrivacy: () => void;
  openSource: (source: SourceDrawerModel) => void;
  closeSource: () => void;
  openEvidence: (isin: string) => void;
  closeEvidence: () => void;
  setAssistantOpen: (open: boolean) => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      language: "en",
      privacy: false,
      source: null,
      evidenceIsin: null,
      assistantOpen: false,
      setLanguage: (language) => set({ language }),
      togglePrivacy: () => set((state) => ({ privacy: !state.privacy })),
      openSource: (source) => set({ source, evidenceIsin: null }),
      closeSource: () => set({ source: null }),
      openEvidence: (isin) => set({ evidenceIsin: isin, source: null }),
      closeEvidence: () => set({ evidenceIsin: null }),
      setAssistantOpen: (assistantOpen) => set({ assistantOpen }),
    }),
    {
      name: "dhandrishti-ui",
      partialize: (state) => ({ language: state.language, privacy: state.privacy }),
    },
  ),
);
