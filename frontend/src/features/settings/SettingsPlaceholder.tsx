import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import type { SettingsSectionId } from "./types";
import { AnimatedPanel } from "../../components/layout/AnimatedPanel";
import { SidebarNav, type SidebarNavGroup } from "../../components/layout/SidebarNav";
import { getStored, setStored, storageKeys } from "../../lib/storage";
import { SettingsHeader } from "./components/SettingsHeader";
import {
  settingsSectionComponentMap,
  settingsSections,
} from "./settingsSections";

export const SettingsPlaceholder = () => {
  const [isWide, setIsWide] = useState<boolean>(() => {
    return getStored(storageKeys.layoutWide("settings"), false);
  });

  const handleToggleWide = (val: boolean) => {
    setIsWide(val);
    setStored(storageKeys.layoutWide("settings"), val);
  };

  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>("notifications");
  const activeConfig =
    settingsSections.find((section) => section.id === activeSection) ??
    settingsSections[0];
  const ActiveSection = settingsSectionComponentMap[activeConfig.id];

  const sidebarGroups = useMemo<SidebarNavGroup<SettingsSectionId>[]>(
    () => [
      {
        title: "설정",
        items: settingsSections.map((section) => ({
          id: section.id,
          label: section.label,
          icon: section.icon,
          className: section.className,
        })),
      },
    ],
    [],
  );

  return (
    <section className="settings-workspace">
      <SidebarNav
        activeId={activeSection}
        groups={sidebarGroups}
        onSelect={setActiveSection}
      />
      <main className="settings-main">
        <AnimatePresence mode="wait">
          <AnimatedPanel key={activeSection} className={`settings-panel ${isWide ? "settings-panel--wide" : ""}`}>
            <SettingsHeader
              config={activeConfig}
              isWide={isWide}
              onToggleWide={handleToggleWide}
            />
            <ActiveSection />
          </AnimatedPanel>
        </AnimatePresence>
      </main>
    </section>
  );
};
