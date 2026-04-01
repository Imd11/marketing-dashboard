import { useState, useCallback, type ChangeEvent, type CompositionEvent } from 'react';

/**
 * Hook to properly handle IME (Input Method Editor) composition input.
 * Fixes the issue where React's onChange fires during composition,
 * causing characters to be committed prematurely in Chinese/Japanese/Korean input.
 */
export function useCompositionInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  const [isComposing, setIsComposing] = useState(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Only update state when not composing (IME composition in progress)
      if (!isComposing) {
        setValue(e.target.value);
      }
    },
    [isComposing]
  );

  const handleCompositionStart = useCallback(
    (_e: CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsComposing(true);
    },
    []
  );

  const handleCompositionEnd = useCallback(
    (e: CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsComposing(false);
      // On composition end, update with the final composed value
      setValue(e.currentTarget.value);
    },
    []
  );

  return {
    value,
    setValue,
    isComposing,
    inputProps: {
      value,
      onChange: handleChange,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
    },
  };
}
