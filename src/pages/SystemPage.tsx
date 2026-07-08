import type { ReactNode } from 'react';
import { Input, Field, EditedMarker } from '../components/ui/Input';
import { AIChip } from '../components/ui/AIChip';
import { StatusChip } from '../components/ui/StatusChip';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { SettlementLedger } from '../components/SettlementLedger';
import { computeSettlement } from '../lib/settlement';
import type { PayoutStatus } from '../lib/types';

const SURFACE_TOKENS = [
  '--surface-page',
  '--surface-raised',
  '--surface-sunken',
  '--surface-selected',
  '--surface-inverse',
  '--border-subtle',
  '--border-strong',
];
const ACCENT_TOKENS = [
  '--action-primary',
  '--accent-ai',
  '--accent-ai-surface',
  '--status-success',
  '--status-warn',
  '--status-danger',
  '--status-info',
];
// 500-weight fills — badges, icons, charts (kept distinct from AA text tones).
const FILL_TOKENS = ['--status-success-fill', '--status-warn-fill', '--status-danger-fill'];
const TEXT_TOKENS = ['--text-primary', '--text-secondary', '--text-tertiary', '--text-link'];

const TYPE_SCALE = [
  { size: 'text-32', label: '32 / mono headline (recipient receives)', mono: true },
  { size: 'text-24', label: '24 / page title' },
  { size: 'text-20', label: '20 / section title' },
  { size: 'text-16', label: '16 / emphasis' },
  { size: 'text-14', label: '14 / subhead' },
  { size: 'text-13', label: '13 / body (product default)' },
  { size: 'text-12', label: '12 / caption' },
];

const ALL_STATUSES: PayoutStatus[] = [
  'draft',
  'needs-review',
  'scheduled',
  'processing',
  'paid',
  'failed',
  'held',
];

export function SystemPage() {
  const settlement = computeSettlement({
    amountSendUsd: 1200,
    receiveCurrency: 'INR',
    rate: 83.215,
    feeUsd: 4.99,
    rail: 'IMPS',
    senderCoversFees: true,
    arrivesAt: '2026-07-10',
  });

  return (
    <div className="space-y-12 pb-16">
      <header>
        <h1 className="text-24 font-600 tracking-tight text-text-primary">Design system</h1>
        <p className="mt-1 max-w-2xl text-13 text-text-secondary">
          The token layer, type scale, and component states behind the prototype. Money is
          typographic material — every amount is mono/tabular, sized by importance. Brand blue is
          for actions, links, and active nav; purple marks AI presence and nothing else.
        </p>
      </header>

      {/* Tokens — both themes */}
      <Section title="Semantic tokens" note="Dark mode remaps this layer only.">
        <div className="grid gap-4 md:grid-cols-2">
          <ThemePanel label="Light">
            <SwatchGrid />
          </ThemePanel>
          <ThemePanel label="Dark" dark>
            <SwatchGrid />
          </ThemePanel>
        </div>
      </Section>

      {/* Type scale */}
      <Section title="Type scale" note="Inter for UI, IBM Plex Mono for all money & data.">
        <div className="space-y-3 rounded-xl border border-border-subtle bg-raised p-6">
          {TYPE_SCALE.map((t) => (
            <div key={t.size} className="flex items-baseline justify-between gap-4">
              <span className={`${t.size} ${t.mono ? 'money' : ''} text-text-primary`}>
                {t.mono ? '₹99,447' : 'The quiet financial instrument'}
              </span>
              <span className="shrink-0 text-12 text-text-tertiary">{t.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Input state matrix */}
      <Section title="Input states" note="ai-filled is a first-class state with provenance.">
        <div className="grid gap-4 rounded-xl border border-border-subtle bg-raised p-6 sm:grid-cols-2">
          <Field label="Default">
            <Input placeholder="Placeholder" />
          </Field>
          <Field label="Focus">
            <Input
              defaultValue="Focused"
              className="outline outline-2 outline-offset-2 outline-[var(--focus-ring)]"
            />
          </Field>
          <Field label="Filled">
            <Input defaultValue="1200" inputClassName="money" />
          </Field>
          <Field label="AI-filled" labelSuffix={<AIChip confidence="high" provenance="Read from invoice line 'Total Due: $1,200.00' · 99% match" />}>
            <Input accent="ai" defaultValue="$1,200.00" inputClassName="money" readOnly />
          </Field>
          <Field label="AI-suggested (ghost)">
            <Input ghost placeholder="$1,200 — matches last 3 monthly payouts" />
          </Field>
          <Field label="Edited" labelSuffix={<EditedMarker />}>
            <Input defaultValue="$1,500.00" inputClassName="money" />
          </Field>
          <Field label="Error" error="Amount exceeds your balance.">
            <Input accent="danger" defaultValue="$60,000.00" inputClassName="money" />
          </Field>
          <Field label="Disabled">
            <Input disabled defaultValue="Locked" />
          </Field>
          <Field label="Medium-confidence match">
            <Input accent="warn" defaultValue="Priya Sharma" />
          </Field>
        </div>
      </Section>

      {/* Status chips */}
      <Section title="Status chips">
        <div className="flex flex-wrap gap-2 rounded-xl border border-border-subtle bg-raised p-6">
          {ALL_STATUSES.map((s) => (
            <StatusChip key={s} status={s} pulse />
          ))}
        </div>
      </Section>

      {/* Buttons / controls / AI */}
      <Section title="Controls">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-subtle bg-raised p-6">
          <Button>Send $1,204.99</Button>
          <Button variant="secondary">Save draft</Button>
          <Button variant="ghost">Not now</Button>
          <Button variant="danger">Approve anyway</Button>
          <SegmentedControl
            value="cover"
            onChange={() => {}}
            segments={[
              { value: 'cover', label: 'You cover fees' },
              { value: 'deduct', label: 'Deduct from payout' },
            ]}
          />
          <AIChip confidence="medium" provenance="This is the AI provenance affordance — the only place the word AI appears." />
        </div>
      </Section>

      {/* Settlement ledger — both emphasis modes */}
      <Section title="Settlement ledger" note="The visual signature — admin and contractor emphasis.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-12 text-text-tertiary">Admin emphasis</p>
            <SettlementLedger settlement={settlement} recipientName="Priya Sharma" />
          </div>
          <div>
            <p className="mb-2 text-12 text-text-tertiary">Contractor emphasis</p>
            <SettlementLedger settlement={settlement} recipientName="Priya Sharma" emphasis="contractor" />
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-3">
        <h2 className="text-16 font-600 text-text-primary">{title}</h2>
        {note && <span className="text-12 text-text-tertiary">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function ThemePanel({ label, dark, children }: { label: string; dark?: boolean; children: ReactNode }) {
  return (
    <div
      data-theme={dark ? 'dark' : undefined}
      className="rounded-xl border border-border-subtle bg-page p-4"
    >
      <p className="mb-3 text-11 uppercase tracking-wide text-text-tertiary">{label}</p>
      {children}
    </div>
  );
}

function SwatchGrid() {
  return (
    <div className="space-y-4">
      <TokenRow tokens={SURFACE_TOKENS} />
      <TokenRow tokens={ACCENT_TOKENS} />
      <TokenRow tokens={FILL_TOKENS} />
      <div className="flex flex-wrap gap-3">
        {TEXT_TOKENS.map((t) => (
          <span key={t} className="text-13" style={{ color: `var(${t})` }}>
            {t.replace('--text-', 'text ')}
          </span>
        ))}
      </div>
    </div>
  );
}

function TokenRow({ tokens }: { tokens: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tokens.map((t) => (
        <div key={t} className="flex flex-col items-center gap-1">
          <span
            className="h-9 w-9 rounded-md border border-border-subtle"
            style={{ background: `var(${t})` }}
          />
          <span className="max-w-[64px] truncate text-[9px] text-text-tertiary" title={t}>
            {t.replace('--', '')}
          </span>
        </div>
      ))}
    </div>
  );
}
