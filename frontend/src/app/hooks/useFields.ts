import { useEffect, useState } from 'react';
import { Field, FieldApi } from '../../services/field.api';

interface UseFieldsResult {
  fields: Field[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useFields(): UseFieldsResult {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    FieldApi.getFields()
      .then((data) => {
        if (active) setFields(data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar canchas',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tick]);

  return { fields, loading, error, reload: () => setTick((t) => t + 1) };
}
