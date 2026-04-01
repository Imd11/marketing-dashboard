import { useState, useRef, useCallback } from 'react';
import { streamGenerate, type GenerateParams } from '@/lib/api/deepseek';

export function useGenerate() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (params: GenerateParams) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Reset output and start loading
    setOutput('');
    setLoading(true);

    try {
      await streamGenerate(
        params,
        (text) => {
          setOutput((prev) => prev + text);
        },
        signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, that's OK
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  return {
    output,
    loading,
    generate,
    cancel,
  };
}
