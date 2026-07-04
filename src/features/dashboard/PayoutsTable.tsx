import { Link } from 'react-router-dom';
import type { Payout } from '../../lib/types';
import { PAYOUTS, getContractor, rateFor } from '../../lib/mock';
import { useStore } from '../../lib/store';
import { formatUSD, formatMoney, formatDateShort } from '../../lib/format';
import { ContractorAvatar } from '../../components/ContractorAvatar';
import { StatusChip } from '../../components/ui/StatusChip';

function arrivalCopy(p: Payout): string {
  if (p.arrivedAt) return `Arrived ${formatDateShort(p.arrivedAt)}`;
  if (p.status === 'failed') return '—';
  if (p.arrivesAt) return `Arrives ${formatDateShort(p.arrivesAt)}`;
  return '—';
}

const METHOD_LABEL = { bank: 'Bank', wallet: 'Wallet', stablecoin: 'USDC' } as const;

/** Payouts table (§3B). Rows link to their status page. Session-committed
 *  payouts appear on top of the mock set. */
export function PayoutsTable() {
  const sent = useStore((s) => s.sentPayouts);
  const sentList = Object.values(sent).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows = [...sentList, ...PAYOUTS.filter((p) => !sent[p.id])];

  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle bg-raised">
      <table className="w-full min-w-[720px] text-13">
        <thead>
          <tr className="border-b border-border-subtle text-left text-11 uppercase tracking-wide text-text-tertiary">
            <Th>Contractor</Th>
            <Th>Invoice</Th>
            <Th>Amount</Th>
            <Th>Method</Th>
            <Th>Status</Th>
            <Th>Arrives</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const c = getContractor(p.contractorId);
            if (!c) return null;
            const receive = formatMoney(p.amountSendUsd * rateFor(c.currency), c.currency, {
              decimals: c.currency === 'USDC' ? 2 : 0,
            });
            return (
              <tr key={p.id} className="group border-b border-border-subtle last:border-b-0 hover:bg-sunken">
                <Td>
                  <Link to={`/payments/status/${p.id}`} className="flex items-center gap-2.5">
                    <ContractorAvatar contractor={c} size="sm" />
                    <span className="text-text-primary">{c.name}</span>
                  </Link>
                </Td>
                <Td>
                  <span className="money text-text-secondary">{p.invoiceNumber ?? '—'}</span>
                </Td>
                <Td>
                  <div className="leading-tight">
                    <span className="money text-text-primary">{formatUSD(p.amountSendUsd)}</span>
                    <span className="money block text-11 text-text-tertiary">
                      {receive} {c.currency}
                    </span>
                  </div>
                </Td>
                <Td>
                  <span className="text-text-secondary">{METHOD_LABEL[p.method.kind]}</span>
                </Td>
                <Td>
                  <StatusChip status={p.status} pulse />
                </Td>
                <Td>
                  <span className="text-text-secondary">{arrivalCopy(p)}</span>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 font-500">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}
