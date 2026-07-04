import type { Contractor } from '../../lib/types';
import { AIChip } from '../../components/ui/AIChip';
import { Field } from '../../components/ui/Input';

/** Purpose-of-payment, shown only for corridors that require it (India in mock
 *  data, §4a.4). Pre-filled with an AI marker + provenance popover. */
export function PurposeCodeSelect({ contractor }: { contractor: Contractor }) {
  const pc = contractor.purposeCode;
  if (!pc) return null;

  return (
    <Field
      label="Purpose of payment"
      hint="Reported to the receiving bank under RBI purpose-code rules."
      labelSuffix={
        <AIChip
          confidence="high"
          provenance={
            <>
              Suggested from contract type and prior payouts. Reported to the receiving bank under
              RBI purpose-code rules.
            </>
          }
        />
      }
    >
      <div className="flex h-9 items-center gap-2 rounded-md border border-border-subtle border-l-2 border-l-ai bg-raised px-3">
        <span className="money text-12 text-text-secondary">{pc.code}</span>
        <span className="text-13 text-text-primary">{pc.label}</span>
      </div>
    </Field>
  );
}
