import type { FormPillar, ShooterId } from "@/lib/formModels";

const STORAGE_KEY = "hls-session-history-v1";
const MAX_ENTRIES = 80;

export type HistoryEntry = {
  id: string;
  at: string; // ISO
  shooterId: ShooterId;
  shooterName: string;
  made: boolean;
  formScore: number;
  weakestPillar: FormPillar;
  cueTitle: string;
  source: "live" | "video";
};

export type HistorySummary = {
  total: number;
  makes: number;
  makePct: number;
  avgForm: number;
  lastForm: number | null;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadHistory(): HistoryEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function appendHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory()].slice(0, MAX_ENTRIES);
  saveHistory(next);
  return next;
}

export function clearHistory() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function summarizeHistory(entries: HistoryEntry[]): HistorySummary {
  if (!entries.length) {
    return { total: 0, makes: 0, makePct: 0, avgForm: 0, lastForm: null };
  }
  const makes = entries.filter((e) => e.made).length;
  const avgForm = Math.round(
    entries.reduce((sum, e) => sum + e.formScore, 0) / entries.length,
  );
  return {
    total: entries.length,
    makes,
    makePct: Math.round((makes / entries.length) * 100),
    avgForm,
    lastForm: entries[0]?.formScore ?? null,
  };
}

export function formatHistoryTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
