import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const STORAGE_KEY_PREFIX = 'tool-storage-';
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

interface ToolStorage {
  fields: Record<string, string>;
  output: string;
  timestamp: number;
}

interface LoadedToolStorage {
  fields: Record<string, string>;
  output: string;
}

function getStorageKey(toolId: string): string {
  return `${STORAGE_KEY_PREFIX}${toolId}`;
}

function isExpired(data: ToolStorage): boolean {
  return Date.now() - data.timestamp > EXPIRY_MS;
}

function loadStoredData<T extends string>(
  toolId: string,
  fieldNames: readonly T[],
  fallbackFields: Record<string, string>
): LoadedToolStorage {
  const key = getStorageKey(toolId);
  const stored = localStorage.getItem(key);

  if (!stored) {
    return { fields: fallbackFields, output: '' };
  }

  try {
    const data: ToolStorage = JSON.parse(stored);
    if (isExpired(data)) {
      localStorage.removeItem(key);
      return { fields: fallbackFields, output: '' };
    }

    const loadedFields = fieldNames.reduce<Record<string, string>>((acc, name) => {
      acc[name] = data.fields?.[name] || '';
      return acc;
    }, {});

    return {
      fields: loadedFields,
      output: data.output || '',
    };
  } catch {
    localStorage.removeItem(key);
    return { fields: fallbackFields, output: '' };
  }
}

export function useToolStorage<T extends string>(
  toolId: string,
  fieldNames: readonly T[]
): Record<T, string> & { output: string; setField: (name: T, value: string) => void; setOutput: (value: string) => void } {
  const initialState = useMemo(
    () => fieldNames.reduce<Record<string, string>>((acc, name) => {
      acc[name] = '';
      return acc;
    }, {}),
    [fieldNames]
  );

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

  const [storedState] = useState(() => loadStoredData(toolId, fieldNames, initialState));
  const [fields, setFieldsState] = useState<Record<string, string>>(storedState.fields);
  const [output, setOutputState] = useState(storedState.output);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  }, [initialState, toolId]);

  const setField = useCallback(
    (name: string, value: string) => {
      setFieldsState((prev) => {
        const updated = { ...prev, [name]: value };
        saveToStorage(updated, output);
        return updated;
      });
      resetExpiryTimer();
    },
    [output, resetExpiryTimer, saveToStorage]
  );

  const setOutput = useCallback(
    (value: string) => {
      setOutputState(value);
      saveToStorage(fields, value);
    },
    [fields, saveToStorage]
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
