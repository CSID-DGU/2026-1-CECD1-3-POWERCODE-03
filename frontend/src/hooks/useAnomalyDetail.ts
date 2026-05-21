import { useEffect, useState } from "react";
import { fetchAnomalyDetail } from "../services/mock/anomaly.mock";
import type { AnomalyDetail } from "../types/domain";

export function useAnomalyDetail(anomalyId: string | null) {
  const [data, setData] = useState<AnomalyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(anomalyId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!anomalyId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    setIsLoading(true);
    fetchAnomalyDetail(anomalyId)
      .then((response) => {
        if (isMounted) setData(response);
      })
      .catch((caughtError: Error) => {
        if (isMounted) setError(caughtError);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [anomalyId]);

  return { data, isLoading, error };
}
