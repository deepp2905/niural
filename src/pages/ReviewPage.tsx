import { useParams } from 'react-router-dom';
import { Placeholder } from '../components/Placeholder';

export function ReviewPage() {
  const { draftId } = useParams();
  return (
    <Placeholder title="Review & confirm" phase="Phase 4 · §5 (hero screen)">
      Settlement ledger, fee-bearer toggle, checks strip, and commit for draft{' '}
      <span className="money">{draftId}</span>. Dark-mode toggle lives here.
    </Placeholder>
  );
}
