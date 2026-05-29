import { useEffect, useState } from "react";
import {
  fetchProcessFeatureDefinitions,
  fetchProcessRawFieldDefinitions,
} from "../services/mock/schema.mock";
import type {
  ProcessFeatureDefinition,
  RawFieldDefinition,
} from "../types/domain";

export function useFeatureSchema() {
  const [featureDefinitions, setFeatureDefinitions] = useState<
    ProcessFeatureDefinition[]
  >([]);
  const [rawFieldDefinitions, setRawFieldDefinitions] = useState<
    RawFieldDefinition[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchProcessFeatureDefinitions(),
      fetchProcessRawFieldDefinitions(),
    ]).then(([features, rawFields]) => {
      if (!isMounted) return;
      setFeatureDefinitions(features);
      setRawFieldDefinitions(rawFields);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return { featureDefinitions, rawFieldDefinitions };
}
