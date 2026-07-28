export function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>Creating your study materials…</p>
      <p className="loading-hint">This usually takes 5–15 seconds.</p>
    </div>
  );
}
