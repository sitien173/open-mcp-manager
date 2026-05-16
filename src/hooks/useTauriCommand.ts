import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface UseTauriCommandOptions<T, R> {
  onSuccess?: (data: R) => void;
  onError?: (error: string) => void;
  initialData?: R;
}

export function useTauriCommand<T = any, R = any>(
  command: string,
  options: UseTauriCommandOptions<T, R> = {}
) {
  const [data, setData] = useState<R | undefined>(options.initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (args?: T) => {
      setLoading(true);
      setError(null);
      try {
        const result = await invoke<R>(command, args as any);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = typeof err === 'string' ? err : JSON.stringify(err);
        setError(errorMessage);
        options.onError?.(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [command, options]
  );

  return { data, loading, error, execute, setData };
}
