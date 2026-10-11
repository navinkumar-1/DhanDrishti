"use client";

import { en, hi, type Dictionary } from "@/lib/i18n/messages";
import { useUi } from "@/store/ui-store";
import type { Copy, Lang } from "@/types/domain";

function lookup(dict: Dictionary, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((node, part) => {
    if (node && typeof node === "object" && part in node) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
  return typeof value === "string" ? value : undefined;
}

export function translate(language: Lang, key: string, vars?: Record<string, string | number>) {
  const primary = language === "hi" ? hi : en;
  const template = lookup(primary, key) ?? lookup(en, key) ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ""));
}

export function useI18n() {
  const language = useUi((state) => state.language);
  const setLanguage = useUi((state) => state.setLanguage);
  return {
    language,
    setLanguage,
    t: (key: string, vars?: Record<string, string | number>) => translate(language, key, vars),
  };
}

export function tx(language: Lang, copy: Copy) {
  return copy[language] || copy.en;
}
