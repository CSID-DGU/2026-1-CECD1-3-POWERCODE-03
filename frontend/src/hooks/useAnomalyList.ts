import { useEffect, useState } from "react";
import { fetchAnomalyList } from "../services/mock/anomaly.mock";
import type { AnomalyListParams, AnomalyListResponse } from "../types/api";

export function useAnomalyList(params: AnomalyListParams = {}) {
  const [data, setData] = useState<AnomalyListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    fetchAnomalyList(params)
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
  }, [params]);

  return { data, isLoading, error };
}
