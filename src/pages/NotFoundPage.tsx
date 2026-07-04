import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-page px-6 text-center">
      <div className="space-y-3">
        <p className="money text-24 text-text-tertiary">404</p>
        <p className="text-14 text-text-secondary">This route isn't part of the prototype.</p>
        <Link
          to="/payments"
          className="inline-block rounded-md bg-action-primary px-3.5 py-2 text-13 font-500 text-text-inverse hover:bg-action-primary-hover"
        >
          Go to payments
        </Link>
      </div>
    </div>
  );
}
