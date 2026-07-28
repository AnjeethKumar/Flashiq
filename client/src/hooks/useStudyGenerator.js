import { useCallback, useRef, useState } from 'react';

export function useStudyGenerator() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [studySet, setStudySet] = useState(null);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  const generate = useCallback(async (notes) => {
    // Cancel any in-flight request
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setStatus('loading');
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      // Ignore stale responses
      if (requestId !== requestIdRef.current) return;

      if (!res.ok) {
        setStatus('error');
        setError(data.error || 'Failed to generate study materials.');
        return;
      }

      setStudySet(data);
      setStatus('success');
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (requestId !== requestIdRef.current) return;

      setStatus('error');
      setError('Network error. Check your connection and try again.');
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    requestIdRef.current += 1;
    setStatus('idle');
    setStudySet(null);
    setError(null);
  }, []);

  return { status, studySet, error, generate, reset };
}
