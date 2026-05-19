import type { ReactNode } from "react";

export type SidebarNavItem<TId extends string> = {
  id: TId;
  label: string;
  count?: number;
  icon: ReactNode;
  className?: string;
};

export type SidebarNavGroup<TId extends string> = {
  title: string;
  items: SidebarNavItem<TId>[];
};

type SidebarNavProps<TId extends string> = {
  activeId: TId;
  groups: SidebarNavGroup<TId>[];
  onSelect: (id: TId) => void;
};

export const SidebarNav = <TId extends string>({ activeId, groups, onSelect }: SidebarNavProps<TId>) => (
  <aside className="section-sidebar">
    {groups.map((group) => (
      <section key={group.title} className="section-sidebar__group">
        <h2>{group.title}</h2>
        {group.items.map((item) => (
          <button
            key={item.id}
            className={`section-sidebar-button ${item.className ?? ""} ${activeId === item.id ? "section-sidebar-button--active" : ""}`}
            type="button"
            onClick={() => onSelect(item.id)}
          >
            <span className="section-sidebar-button__icon">{item.icon}</span>
            <span>{item.label}</span>
            {typeof item.count === "number" && <strong>{item.count}</strong>}
          </button>
        ))}
      </section>
    ))}
  </aside>
);
