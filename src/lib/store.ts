/*
 * Session store (§9). Drafts, approvals, and dismissals persist across route
 * changes within a session — but NOT to localStorage (§10). Zustand's default
 * in-memory store gives exactly that: state survives navigation, resets on
 * full reload. That reset is intentional for a demo.
 */

import { create } from 'zustand';
import type { Draft, Payout } from './types';

interface AppState {
  drafts: Record<string, Draft>;
  /** Payouts committed during the session (§5F commit → §6 status). */
  sentPayouts: Record<string, Payout>;
  /** Bulk items the user has individually resolved (approved/held). */
  bulkResolved: Record<string, 'approved' | 'held'>;
  /** Payouts the user has cancelled within the hold window (§6a). */
  cancelled: Record<string, boolean>;
  /** Dismissed inline prompts / queue cards, keyed by id. */
  dismissed: Record<string, boolean>;
  /** Whether the low-balance scenario is active (§6b toggle). */
  lowBalanceScenario: boolean;

  upsertDraft: (draft: Draft) => void;
  getDraft: (id: string) => Draft | undefined;
  recordSentPayout: (payout: Payout) => void;
  getSentPayout: (id: string) => Payout | undefined;
  resolveBulkItem: (id: string, verdict: 'approved' | 'held') => void;
  cancelPayout: (id: string) => void;
  dismiss: (id: string) => void;
  setLowBalanceScenario: (on: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  drafts: {},
  sentPayouts: {},
  bulkResolved: {},
  cancelled: {},
  dismissed: {},
  lowBalanceScenario: false,

  upsertDraft: (draft) => set((s) => ({ drafts: { ...s.drafts, [draft.id]: draft } })),
  getDraft: (id) => get().drafts[id],
  recordSentPayout: (payout) =>
    set((s) => ({ sentPayouts: { ...s.sentPayouts, [payout.id]: payout } })),
  getSentPayout: (id) => get().sentPayouts[id],
  resolveBulkItem: (id, verdict) =>
    set((s) => ({ bulkResolved: { ...s.bulkResolved, [id]: verdict } })),
  cancelPayout: (id) => set((s) => ({ cancelled: { ...s.cancelled, [id]: true } })),
  dismiss: (id) => set((s) => ({ dismissed: { ...s.dismissed, [id]: true } })),
  setLowBalanceScenario: (on) => set({ lowBalanceScenario: on }),
}));

/** Create a short unique id (drafts, etc.). */
export function makeId(prefix = 'draft'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}
