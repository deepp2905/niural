import { useSearchParams } from 'react-router-dom';
import { ManualCreate } from '../features/create/ManualCreate';
import { Placeholder } from '../components/Placeholder';

export function CreatePage() {
  const [params] = useSearchParams();
  const invoiceId = params.get('invoice');

  if (invoiceId) {
    // Invoice-parsed path lands in Phase 3.
    return (
      <Placeholder title="Create payout — invoice-parsed path" phase="Phase 3 · §4b">
        Two-pane invoice viewer + AI-extracted form for {invoiceId} (§4b).
      </Placeholder>
    );
  }

  return <ManualCreate />;
}
