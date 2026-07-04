import { Drawer } from '../../components/ui/Drawer';

/** Read-only company policy view (§7D, concept fidelity). */
export function PolicyDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const policies = [
    { title: 'Individual approval over $5,000', body: 'Any single payout above $5,000 is excluded from batch approval and must be approved on its own.' },
    { title: 'Voice verification on account changes', body: 'A payout whose bank details changed within 7 days of the invoice is flagged for voice verification before approval.' },
    { title: 'Duplicate window', body: 'Payouts matching a prior amount + period within 30 days are flagged as possible duplicates.' },
    { title: 'Anomaly threshold', body: 'Amounts above 2.5× a contractor’s trailing average are flagged for review.' },
  ];
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Approval policy" description="Managed by your admin — read-only here">
      <div className="space-y-4">
        {policies.map((p) => (
          <div key={p.title} className="rounded-lg border border-border-subtle bg-raised p-3.5">
            <p className="text-13 font-600 text-text-primary">{p.title}</p>
            <p className="mt-1 text-12 leading-relaxed text-text-secondary">{p.body}</p>
          </div>
        ))}
        <p className="text-12 text-text-tertiary">
          Editing policies is out of scope for this prototype.
        </p>
      </div>
    </Drawer>
  );
}
