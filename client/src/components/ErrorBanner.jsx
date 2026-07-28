export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner" role="alert">
      <div className="error-content">
        <strong>Something went wrong</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
