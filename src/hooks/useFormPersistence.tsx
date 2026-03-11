import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY_PREFIX = "backstage_form_";
const DEBOUNCE_MS = 500;

interface UseFormPersistenceOptions<T> {
  key: string;
  initialValue: T;
  enabled?: boolean;
}

export function useFormPersistence<T>({
  key,
  initialValue,
  enabled = true,
}: UseFormPersistenceOptions<T>) {
  const storageKey = `${STORAGE_KEY_PREFIX}${key}`;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize state from localStorage or initial value
  const [value, setValue] = useState<T>(() => {
    if (!enabled) return initialValue;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initial value to handle new fields
        return { ...initialValue, ...parsed };
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
    return initialValue;
  });

  // Save to localStorage with debounce
  const persistValue = useCallback(
    (newValue: T) => {
      if (!enabled) return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newValue));
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }
      }, DEBOUNCE_MS);
    },
    [storageKey, enabled]
  );

  // Update value and persist
  const updateValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const updated = typeof newValue === "function" 
          ? (newValue as (prev: T) => T)(prev) 
          : newValue;
        persistValue(updated);
        return updated;
      });
    },
    [persistValue]
  );

  // Clear persisted data
  const clearPersisted = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }, [storageKey]);

  // Reset to initial value and clear storage
  const reset = useCallback(() => {
    setValue(initialValue);
    clearPersisted();
  }, [initialValue, clearPersisted]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    value,
    setValue: updateValue,
    clearPersisted,
    reset,
    hasPersistedData: () => {
      try {
        return !!localStorage.getItem(storageKey);
      } catch {
        return false;
      }
    },
  };
}

// Utility to check if there's persisted show data
export function hasPersistedShowData(): boolean {
  try {
    const formData = localStorage.getItem(`${STORAGE_KEY_PREFIX}novo_show_form`);
    const expenses = localStorage.getItem(`${STORAGE_KEY_PREFIX}novo_show_expenses`);
    const musicians = localStorage.getItem(`${STORAGE_KEY_PREFIX}novo_show_musicians`);
    
    // Check if any has meaningful data
    if (formData) {
      const parsed = JSON.parse(formData);
      if (parsed.name || parsed.date || parsed.venue) return true;
    }
    if (expenses) {
      const parsed = JSON.parse(expenses);
      if (Array.isArray(parsed) && parsed.length > 0) return true;
    }
    if (musicians) {
      const parsed = JSON.parse(musicians);
      if (Array.isArray(parsed) && parsed.length > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Clear all show form data
export function clearAllShowFormData(): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}novo_show_form`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}novo_show_expenses`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}novo_show_musicians`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}novo_show_client`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}novo_show_recurring`);
  } catch (error) {
    console.error("Error clearing show form data:", error);
  }
}
