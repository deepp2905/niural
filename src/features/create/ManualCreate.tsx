import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Contractor, PayBasis, PayoutMethodKind } from '../../lib/types';
import { CONTRACTORS, WALLET, WALLET_LOW_BALANCE, methodOfKind, rateFor } from '../../lib/mock';
import { useStore, makeId } from '../../lib/store';
import { amountAnomaly, buildFlags } from '../../lib/anomaly';
import { settlementFromMethod, walletImpact } from '../../lib/settlement';
import { Combobox } from '../../components/ui/Combobox';
import { Field } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ContractorAvatar } from '../../components/ContractorAvatar';
import { PayBasisInput } from '../../components/ui/PayBasisInput';
import { ContractorContextCard } from './ContractorContextCard';
import { MethodCards } from './MethodCards';
import { PurposeCodeSelect } from './PurposeCodeSelect';

export function ManualCreate() {
  const navigate = useNavigate();
  const upsertDraft = useStore((s) => s.upsertDraft);
  const lowBalance = useStore((s) => s.lowBalanceScenario);

  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [amountUsd, setAmountUsd] = useState<number | null>(null);
  const [payBasis, setPayBasis] = useState<PayBasis | null>(null);
  const [methodKind, setMethodKind] = useState<PayoutMethodKind>('bank');
  const [note, setNote] = useState('');

  const anomaly = useMemo(
    () => (contractor && amountUsd ? amountAnomaly(contractor, amountUsd) : null),
    [contractor, amountUsd],
  );

  const onSelectContractor = (c: Contractor) => {
    setContractor(c);
    setMethodKind(c.defaultMethod.kind);
    setAmountUsd(null);
    setPayBasis(null);
  };

  const canContinue = !!contractor && !!amountUsd && amountUsd > 0;

  const submit = (asDraft: boolean) => {
    if (!contractor || !amountUsd) return;
    const method = methodOfKind(contractor, methodKind) ?? contractor.defaultMethod;
    const balance = lowBalance ? WALLET_LOW_BALANCE : WALLET.balanceUsd;
    const settlement = settlementFromMethod({
      amountSendUsd: amountUsd,
      receiveCurrency: contractor.currency,
      rate: rateFor(contractor.currency),
      method,
      senderCoversFees: true,
      arrivesAt: new Date().toISOString(),
    });
    const impact = walletImpact(balance, settlement);

    const flags = buildFlags({
      contractor,
      amountUsd,
      lowBalanceShortfallUsd: impact.shortfallUsd,
    });

    const draft = {
      id: makeId(),
      contractorId: contractor.id,
      amountSendUsd: amountUsd,
      payBasis: payBasis ?? undefined,
      methodKind,
      senderCoversFees: true,
      purposeCode: contractor.purposeCode,
      note: note.trim() || undefined,
      flags,
      createdAt: new Date().toISOString(),
    };
    upsertDraft(draft);
    if (!asDraft) navigate(`/payments/review/${draft.id}`);
    else navigate('/payments');
  };

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6">
        <h1 className="text-24 font-600 tracking-tight text-text-primary">New payout</h1>
        <p className="mt-1 text-13 text-text-secondary">
          Pay a pre-onboarded contractor. You'll review every figure before anything moves.
        </p>
      </header>

      <div className="space-y-7">
        {/* 1. Contractor */}
        <Field label="Contractor" htmlFor="contractor">
          <Combobox
            id="contractor"
            items={CONTRACTORS}
            value={contractor}
            onChange={onSelectContractor}
            getKey={(c) => c.id}
            getSearchText={(c) => `${c.name} ${c.country}`}
            placeholder="Search contractors…"
            renderItem={(c) => (
              <span className="flex items-center gap-2.5">
                <ContractorAvatar contractor={c} size="sm" />
                <span className="text-text-primary">{c.name}</span>
                <span className="text-12 text-text-tertiary">{c.country}</span>
              </span>
            )}
            renderValue={(c) => (
              <span className="flex items-center gap-2.5">
                <ContractorAvatar contractor={c} size="sm" />
                <span>{c.name}</span>
              </span>
            )}
          />
          <AnimatePresence>
            {contractor && <ContractorContextCard key={contractor.id} contractor={contractor} />}
          </AnimatePresence>
        </Field>

        {/* 2. Amount — denominated in the contractor's currency, USD derived */}
        {contractor && (
          <Field
            label="Amount"
            htmlFor="amount"
            hint={`Set what ${contractor.name.split(' ')[0]} is paid in ${contractor.currency}; we convert to the USD you'll pay at the mid-market rate.`}
          >
            <PayBasisInput
              key={contractor.id}
              id="amount"
              autoFocus
              receiveCurrency={contractor.currency}
              rate={rateFor(contractor.currency)}
              onChange={(r) => {
                setAmountUsd(r ? r.amountUsd : null);
                setPayBasis(r ? r.basis : null);
              }}
              anomaly={anomaly}
            />
          </Field>
        )}

        {/* 3. Method */}
        {contractor && (
          <Field label="Payment method">
            <MethodCards contractor={contractor} value={methodKind} onChange={setMethodKind} />
          </Field>
        )}

        {/* 4. Purpose code (corridor-conditional) */}
        {contractor && <PurposeCodeSelect contractor={contractor} />}

        {/* 5. Note */}
        {contractor && (
          <Field label="Note to contractor" hint="Optional — appears on their remittance view.">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. June retainer, thanks!"
              className="w-full resize-none rounded-md border border-border-subtle bg-raised px-3 py-2 text-13 text-text-primary outline-none placeholder:text-text-tertiary focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--focus-ring)]"
            />
          </Field>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-border-subtle pt-5">
          <Button size="lg" disabled={!canContinue} onClick={() => submit(false)}>
            Continue to review
          </Button>
          <Button variant="ghost" size="lg" disabled={!canContinue} onClick={() => submit(true)}>
            Save draft
          </Button>
        </div>
      </div>
    </div>
  );
}
