import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  const parts = name.replace(/[^A-Za-z\s]/g, " ").trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?").toUpperCase();
}
