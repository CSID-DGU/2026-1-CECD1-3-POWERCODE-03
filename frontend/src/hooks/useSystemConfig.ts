import { useEffect, useState } from "react";
import {
  defaultSystemConfig,
  fetchSystemConfig,
  saveSystemConfig,
} from "../services/mock/admin.mock";
import type { SystemConfig } from "../types/domain";

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig>(defaultSystemConfig);

  useEffect(() => {
    fetchSystemConfig().then(setConfig);
  }, []);

  const saveConfig = async (nextConfig: SystemConfig) => {
    setConfig(nextConfig);
    await saveSystemConfig(nextConfig);
  };

  return { config, setConfig, saveConfig };
}
