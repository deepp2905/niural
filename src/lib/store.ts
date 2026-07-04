/*
 * Session store (§9). Drafts, approvals, and dismissals persist across route
 * changes within a session — but NOT to localStorage (§10). Zustand's default
 * in-memory store gives exactly that: state survives navigation, resets on
 * full reload. That reset is intentional for a demo.
 */

import { create } from 'zustand';
import type { Draft } from './types';

interface AppState {
  drafts: Record<string, Draft>;
  /** Bulk items the user has individually resolved (approved/held). */
  bulkResolved: Record<string, 'approved' | 'held'>;
  /** Dismissed inline prompts / queue cards, keyed by id. */
  dismissed: Record<string, boolean>;
  /** Whether the low-balance scenario is active (§6b toggle). */
  lowBalanceScenario: boolean;

  upsertDraft: (draft: Draft) => void;
  getDraft: (id: string) => Draft | undefined;
  resolveBulkItem: (id: string, verdict: 'approved' | 'held') => void;
  dismiss: (id: string) => void;
  setLowBalanceScenario: (on: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  drafts: {},
  bulkResolved: {},
  dismissed: {},
  lowBalanceScenario: false,

  upsertDraft: (draft) => set((s) => ({ drafts: { ...s.drafts, [draft.id]: draft } })),
  getDraft: (id) => get().drafts[id],
  resolveBulkItem: (id, verdict) =>
    set((s) => ({ bulkResolved: { ...s.bulkResolved, [id]: verdict } })),
  dismiss: (id) => set((s) => ({ dismissed: { ...s.dismissed, [id]: true } })),
  setLowBalanceScenario: (on) => set({ lowBalanceScenario: on }),
}));

/** Create a short unique id (drafts, etc.). */
export function makeId(prefix = 'draft'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}
