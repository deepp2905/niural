import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Contractor, Invoice, PayoutMethodKind } from '../../lib/types';
import {
  CONTRACTORS,
  WALLET,
  WALLET_LOW_BALANCE,
  getContractor,
  getInvoice,
  methodOfKind,
  rateFor,
} from '../../lib/mock';
import { useStore, makeId } from '../../lib/store';
import { buildFlags } from '../../lib/anomaly';
import { settlementFromMethod, walletImpact } from '../../lib/settlement';
import { formatMoney, formatDateLong } from '../../lib/format';
import { AIChip, SparkGlyph } from '../../components/ui/AIChip';
import { Field, Input, EditedMarker } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Combobox } from '../../components/ui/Combobox';
import { ContractorAvatar } from '../../components/ContractorAvatar';
import { CheckIcon, AlertTriangleIcon } from '../../components/ui/Icon';
import { MethodCards } from './MethodCards';
import { PurposeCodeSelect } from './PurposeCodeSelect';
import { InvoiceDocument } from './InvoiceDocument';
import { cn } from '../../lib/cn';

/** Two-pane invoice-parsed create (§4b). Left: fake PDF. Right: AI-extracted
 *  form with per-field confidence states and hover-linking to the document. */
export function InvoiceCreate({
  invoice,
  duplicateAcknowledged,
}: {
  invoice: Invoice;
  duplicateAcknowledged: boolean;
}) {
  const navigate = useNavigate();
  const upsertDraft = useStore((s) => s.upsertDraft);
  const lowBalance = useStore((s) => s.lowBalanceScenario);

  const [hovered, setHovered] = useState<string | null>(null);

  // Field state, seeded from the AI extraction.
  const matched = getContractor(invoice.fields.contractorMatch.value)!;
  const [contractor, setContractor] = useState<Contractor>(matched);
  const [contractorConfirmed, setContractorConfirmed] = useState(false);
  const [changingContractor, setChangingContractor] = useState(false);

  const [amountUsd, setAmountUsd] = useState<number>(invoice.fields.amountUsd.value);
  const [amountEdited, setAmountEdited] = useState(false);

  const [dueDate, setDueDate] = useState<string | null>(invoice.fields.dueDate.value);
  const [dueDateManual, setDueDateManual] = useState(false);

  const [methodKind, setMethodKind] = useState<PayoutMethodKind>(matched.defaultMethod.kind);
  const [note, setNote] = useState('');

  const rate = rateFor(contractor.currency);
  const receive = useMemo(
    () => formatMoney(amountUsd * rate, contractor.currency, { decimals: contractor.currency === 'USDC' ? 2 : 0 }),
    [amountUsd, rate, contractor.currency],
  );

  const onChangeContractor = (c: Contractor) => {
    setContractor(c);
    setContractorConfirmed(true);
    setChangingContractor(false);
    setMethodKind(c.defaultMethod.kind);
  };

  const canContinue = contractorConfirmed || contractor.id === matched.id;

  const submit = () => {
    const method = methodOfKind(contractor, methodKind) ?? contractor.defaultMethod;
    const balance = lowBalance ? WALLET_LOW_BALANCE : WALLET.balanceUsd;
    const settlement = settlementFromMethod({
      amountSendUsd: amountUsd,
      receiveCurrency: contractor.currency,
      rate,
      method,
      senderCoversFees: true,
      arrivesAt: new Date().toISOString(),
    });
    const impact = walletImpact(balance, settlement);

    const flags = buildFlags({
      contractor,
      amountUsd,
      duplicateAcknowledged: duplicateAcknowledged && !!invoice.duplicateOfInvoiceId,
      duplicateInvoiceNumber: invoice.duplicateOfInvoiceId
        ? getInvoice(invoice.duplicateOfInvoiceId)?.number
        : undefined,
      lowBalanceShortfallUsd: impact.shortfallUsd,
    });

    const draft = {
      id: makeId(),
      contractorId: contractor.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      amountSendUsd: amountUsd,
      methodKind,
      senderCoversFees: true,
      purposeCode: contractor.purposeCode,
      note: note.trim() || undefined,
      flags,
      createdAt: new Date().toISOString(),
    };
    upsertDraft(draft);
    navigate(`/payments/review/${draft.id}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[40%_1fr]">
      {/* Left: document */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <InvoiceDocument invoice={invoice} hoveredField={hovered} />
        <p className="mt-2 px-1 text-12 text-text-tertiary">
          Hover a field to see where the agent read it.
        </p>
      </div>

      {/* Right: extracted form */}
      <div>
        <header className="mb-5">
          <h1 className="text-24 font-600 tracking-tight text-text-primary">Review extracted payout</h1>
          <p className="mt-1 flex items-center gap-1.5 text-13 text-text-secondary">
            <SparkGlyph className="shrink-0 text-ai" />
            Read from the invoice on the left. Verify each field before continuing.
          </p>
        </header>

        {duplicateAcknowledged && invoice.duplicateOfInvoiceId && (
          <p className="mb-4 flex items-start gap-1.5 rounded-md bg-warn-surface px-3 py-2 text-12 text-text-primary">
            <AlertTriangleIcon size={14} className="mt-[1px] shrink-0 text-warn" />
            Duplicate acknowledged — this note carries to review.
          </p>
        )}

        <div className="space-y-6">
          {/* Contractor — medium confidence */}
          <HoverField field="contractorMatch" onHover={setHovered}>
            <Field label="Contractor">
              {changingContractor ? (
                <Combobox
                  items={CONTRACTORS}
                  value={contractor}
                  onChange={onChangeContractor}
                  getKey={(c) => c.id}
                  getSearchText={(c) => `${c.name} ${c.country}`}
                  renderItem={(c) => (
                    <span className="flex items-center gap-2.5">
                      <ContractorAvatar contractor={c} size="sm" />
                      {c.name}
                    </span>
                  )}
                />
              ) : (
                <div
                  className={cn(
                    'rounded-lg border bg-raised p-3',
                    contractorConfirmed
                      ? 'border-border-subtle'
                      : 'border-border-subtle border-l-2 border-l-warn',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <ContractorAvatar contractor={contractor} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-13 font-600 text-text-primary">{contractor.name}</p>
                      <p className="text-12 text-text-tertiary">
                        {contractor.country} · pays in {contractor.currency}
                      </p>
                    </div>
                    {contractorConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-12 text-success">
                        <CheckIcon size={13} /> confirmed
                      </span>
                    ) : (
                      <AIChip confidence="medium" provenance={invoice.fields.contractorMatch.evidence} />
                    )}
                  </div>

                  {!contractorConfirmed && (
                    <>
                      <p className="mt-2.5 text-12 leading-snug text-text-secondary">
                        {invoice.fields.contractorMatch.evidence}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={() => setContractorConfirmed(true)}>
                          Confirm match
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setChangingContractor(true)}>
                          Change
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Field>
          </HoverField>

          {/* Amount — high confidence */}
          <HoverField field="amountUsd" onHover={setHovered}>
            <Field
              label="Amount"
              hint={`Recipient gets ${receive} ${contractor.currency} at today's mid-market rate.`}
              labelSuffix={
                amountEdited ? (
                  <EditedMarker />
                ) : (
                  <AIChip confidence="high" provenance={invoice.fields.amountUsd.evidence} />
                )
              }
            >
              <Input
                leading={<span className="money text-16">$</span>}
                accent={amountEdited ? 'none' : 'ai'}
                value={amountUsd}
                inputMode="decimal"
                inputClassName="money text-16"
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^0-9.]/g, ''));
                  setAmountUsd(Number.isFinite(n) ? n : 0);
                  setAmountEdited(true);
                }}
                suffix={<span className="text-12 font-500 text-text-tertiary">USD</span>}
              />
            </Field>
          </HoverField>

          {/* Invoice number — high confidence, read-only display */}
          <HoverField field="invoiceNumber" onHover={setHovered}>
            <Field label="Invoice number" labelSuffix={<AIChip confidence="high" provenance={invoice.fields.invoiceNumber.evidence} />}>
              <Input accent="ai" readOnly value={invoice.number} inputClassName="money" />
            </Field>
          </HoverField>

          {/* Due date — low confidence */}
          <HoverField field="dueDate" onHover={setHovered}>
            <Field label="Due date">
              {dueDate && !dueDateManual ? (
                <Input
                  readOnly
                  value={formatDateLong(dueDate)}
                  suffix={<span className="text-12 text-success">accepted</span>}
                />
              ) : dueDateManual ? (
                <Input
                  type="date"
                  value={dueDate ?? ''}
                  onChange={(e) => setDueDate(e.target.value || null)}
                  inputClassName="money"
                />
              ) : (
                <div className="rounded-md border border-dashed border-border-strong bg-sunken px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-12 text-text-secondary">
                    <AIChip confidence="low" provenance={invoice.fields.dueDate.evidence} />
                    Possibly Jul 15 — the due-date field is smudged, low confidence.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setDueDate('2026-07-15')}>
                      Accept Jul 15
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDueDateManual(true)}>
                      Enter manually
                    </Button>
                  </div>
                </div>
              )}
            </Field>
          </HoverField>

          {/* Method */}
          <Field label="Payment method">
            <MethodCards contractor={contractor} value={methodKind} onChange={setMethodKind} />
          </Field>

          {/* Purpose code */}
          <PurposeCodeSelect contractor={contractor} />

          {/* Note */}
          <Field label="Note to contractor" hint="Optional — appears on their remittance view.">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. June retainer, thanks!"
              className="w-full resize-none rounded-md border border-border-subtle bg-raised px-3 py-2 text-13 text-text-primary outline-none placeholder:text-text-tertiary focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--focus-ring)]"
            />
          </Field>

          <div className="flex items-center gap-3 border-t border-border-subtle pt-5">
            <Button size="lg" disabled={!canContinue} onClick={submit}>
              Continue to review
            </Button>
            {!canContinue && (
              <span className="text-12 text-text-tertiary">Confirm the contractor match first.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Wraps a field so hovering it highlights the matching invoice region. */
function HoverField({
  field,
  onHover,
  children,
}: {
  field: string;
  onHover: (field: string | null) => void;
  children: ReactNode;
}) {
  return (
    <div onMouseEnter={() => onHover(field)} onMouseLeave={() => onHover(null)}>
      {children}
    </div>
  );
}
