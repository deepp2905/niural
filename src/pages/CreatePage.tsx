import { useSearchParams } from 'react-router-dom';
import { Placeholder } from '../components/Placeholder';

export function CreatePage() {
  const [params] = useSearchParams();
  const invoiceId = params.get('invoice');
  return (
    <Placeholder
      title={invoiceId ? 'Create payout — invoice-parsed path' : 'Create payout — manual path'}
      phase={invoiceId ? 'Phase 3 · §4b' : 'Phase 2 · §4a'}
    >
      {invoiceId
        ? `Two-pane invoice viewer + AI-extracted form for ${invoiceId} (§4b).`
        : 'Contractor select, CurrencyAmountInput, method cards, purpose code (§4a).'}
    </Placeholder>
  );
}
