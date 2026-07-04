import { motion } from 'framer-motion';
import type { Contractor } from '../../lib/types';
import { ContractorAvatar } from '../../components/ContractorAvatar';
import { VerificationBadge } from '../../components/VerificationBadge';
import { formatUSD, formatDateShort, formatMonthYear } from '../../lib/format';

/** Compact context card that slides in when a contractor is selected (§4a.1).
 *  Height-auto Framer Motion, ≤200ms — respects reduced-motion via the global
 *  CSS override and Framer's own reduced-motion handling. */
export function ContractorContextCard({ contractor }: { contractor: Contractor }) {
  const last = contractor.history[0];
  const tax = contractor.taxForm;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-2 rounded-lg border border-border-subtle bg-sunken p-4">
        <div className="flex items-start gap-3">
          <ContractorAvatar contractor={contractor} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-14 font-600 text-text-primary">{contractor.name}</span>
              <span className="text-12 text-text-tertiary">
                {contractor.country} · pays in {contractor.currency}
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              <Row label="Default method">
                <span className="text-13 text-text-primary">{contractor.defaultMethod.label}</span>
                <VerificationBadge
                  verified={contractor.defaultMethod.verification.verified}
                  method={contractor.defaultMethod.verification.method}
                />
              </Row>

              <Row label="Last payout">
                {last ? (
                  <span className="text-13 text-text-secondary">
                    <span className="money text-text-primary">{formatUSD(last.amountUsd)}</span> ·{' '}
                    {formatDateShort(last.date)} · arrived in {last.arrivedIn}
                  </span>
                ) : (
                  <span className="text-13 text-text-tertiary">No prior payouts</span>
                )}
              </Row>

              <Row label="Tax form">
                {tax.status === 'valid' ? (
                  <span className="inline-flex items-center gap-1.5 text-13 text-text-secondary">
                    <span className="text-success">✓</span>
                    {tax.kind} on file, valid through{' '}
                    {tax.validThrough ? formatMonthYear(tax.validThrough) : '—'}
                  </span>
                ) : tax.status === 'expired' ? (
                  <span className="inline-flex items-center gap-1.5 text-13 text-danger">
                    ⛔ {tax.kind} expired {tax.expiredOn ? formatMonthYear(tax.expiredOn) : ''}
                  </span>
                ) : (
                  <span className="text-13 text-warn">⚠ {tax.kind} missing</span>
                )}
              </Row>

              {contractor.purposeCode && (
                <Row label="Purpose code">
                  <span className="money text-13 text-text-secondary">
                    {contractor.purposeCode.code}
                  </span>
                  <span className="text-13 text-text-secondary">
                    {contractor.purposeCode.label}
                  </span>
                </Row>
              )}
            </dl>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-11 uppercase tracking-wide text-text-tertiary">{label}</dt>
      <dd className="mt-0.5 flex flex-wrap items-center gap-1.5">{children}</dd>
    </div>
  );
}
