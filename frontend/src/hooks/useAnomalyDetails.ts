import { useEffect, useState } from "react";
import { fetchAllAnomalyDetails } from "../services/mock/anomaly.mock";
import type { AnomalyDetail } from "../types/domain";

export function useAnomalyDetails() {
  const [details, setDetails] = useState<AnomalyDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchAllAnomalyDetails()
      .then((response) => {
        if (isMounted) setDetails(response);
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
  }, []);

  return { details, isLoading, error };
}
