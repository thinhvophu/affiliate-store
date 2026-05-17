import { ShellLayoutDrawer } from "./ShellLayoutDrawer";
import styles from "./ShellLayout.module.css";

export interface ShellLayoutProps {
  leftPanel: React.ReactNode;
  children: React.ReactNode;
  leftPanelTitle?: string;
  leftPanelTriggerLabel?: string;
}

export function ShellLayout({
  leftPanel,
  children,
  leftPanelTitle,
  leftPanelTriggerLabel,
}: ShellLayoutProps) {
  return (
    <div className={styles.container}>
      {/* Mobile: drawer trigger + slide-out panel (hidden ≥768px via CSS) */}
      <ShellLayoutDrawer
        leftPanel={leftPanel}
        title={leftPanelTitle}
        triggerLabel={leftPanelTriggerLabel}
      />
      <div className={styles.grid}>
        {/* Desktop: inline left panel (hidden <768px via CSS) */}
        <aside className={styles.leftPanel}>{leftPanel}</aside>
        <div className={styles.main}>{children}</div>
      </div>
    </div>
  );
}
