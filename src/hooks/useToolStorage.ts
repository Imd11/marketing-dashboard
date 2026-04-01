import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY_PREFIX = 'tool-storage-';
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

interface ToolStorage {
  fields: Record<string, string>;
  output: string;
  timestamp: number;
}

function getStorageKey(toolId: string): string {
  return `${STORAGE_KEY_PREFIX}${toolId}`;
}

function isExpired(data: ToolStorage): boolean {
  return Date.now() - data.timestamp > EXPIRY_MS;
}

export function useToolStorage<T extends string>(
  toolId: string,
  fieldNames: readonly T[]
): Record<T, string> & { output: string; setField: (name: T, value: string) => void; setOutput: (value: string) => void } {
  // Initialize state for each field
  const initialState: Record<string, string> = {};
  fieldNames.forEach((name) => {
    initialState[name] = '';
  });

  const [fields, setFieldsState] = useState<Record<string, string>>(initialState);
  const [output, setOutputState] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const key = getStorageKey(toolId);
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const data: ToolStorage = JSON.parse(stored);
        if (!isExpired(data)) {
          const loadedFields: Record<string, string> = {};
          fieldNames.forEach((name) => {
            loadedFields[name] = data.fields?.[name] || '';
          });
          setFieldsState(loadedFields);
          setOutputState(data.output || '');
          // Reset timestamp to now (extend expiry)
          saveToStorage(loadedFields, data.output || '');
        } else {
          // Expired, clear storage
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
  }, [toolId, fieldNames]);

  // Save to localStorage
  const saveToStorage = useCallback(
    (newFields: Record<string, string>, newOutput: string) => {
      const key = getStorageKey(toolId);
      const fullData: ToolStorage = {
        fields: newFields,
        output: newOutput,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(fullData));
    },
    [toolId]
  );

  // Clear existing timer
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [toolId]);

  // Set timer to clear after 10 minutes of inactivity
  const resetExpiryTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      const key = getStorageKey(toolId);
      localStorage.removeItem(key);
      setFieldsState(initialState);
      setOutputState('');
    }, EXPIRY_MS);
  }, [toolId]);

  const setField = useCallback(
    (name: string, value: string) => {
      setFieldsState((prev) => {
        const updated = { ...prev, [name]: value };
        saveToStorage(updated, output);
        return updated;
      });
      resetExpiryTimer();
    },
    [toolId, output, saveToStorage, resetExpiryTimer]
  );

  const setOutput = useCallback(
    (value: string) => {
      setOutputState(value);
      saveToStorage(fields, value);
    },
    [toolId, fields, saveToStorage]
  );

  // Build return object with individual getters
  const result = {} as Record<T, string>;
  fieldNames.forEach((name) => {
    result[name] = fields[name] || '';
  });

  return {
    ...result,
    output,
    setField: setField as (name: T, value: string) => void,
    setOutput,
  };
}
