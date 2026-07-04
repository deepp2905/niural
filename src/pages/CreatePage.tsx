import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ManualCreate } from '../features/create/ManualCreate';
import { InvoiceCreate } from '../features/create/InvoiceCreate';
import { DuplicateInterstitial } from '../features/create/DuplicateInterstitial';
import { getInvoice } from '../lib/mock';
import { Placeholder } from '../components/Placeholder';

export function CreatePage() {
  const [params] = useSearchParams();
  const invoiceId = params.get('invoice');
  const invoice = invoiceId ? getInvoice(invoiceId) : undefined;

  // Duplicate guard: gate the form behind a blocking interstitial (§4b).
  const [dupPassed, setDupPassed] = useState(false);

  if (!invoiceId) return <ManualCreate />;

  if (!invoice) {
    return (
      <Placeholder title="Invoice not found" phase="§4b">
        No mock invoice matches “{invoiceId}”.
      </Placeholder>
    );
  }

  if (invoice.duplicateOfInvoiceId && !dupPassed) {
    return <DuplicateInterstitial invoice={invoice} onContinue={() => setDupPassed(true)} />;
  }

  return <InvoiceCreate invoice={invoice} duplicateAcknowledged={dupPassed} />;
}
