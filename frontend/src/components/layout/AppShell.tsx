import type { PropsWithChildren, ReactNode } from "react";

type AppShellProps = PropsWithChildren<{
  topNav: ReactNode;
}>;

export const AppShell = ({ topNav, children }: AppShellProps) => (
  <main className="app-shell">
    {topNav}
    <section className="workspace">{children}</section>
  </main>
);
