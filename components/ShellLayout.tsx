import styles from "./ShellLayout.module.css";

export interface ShellLayoutProps {
  leftPanel: React.ReactNode;
  children: React.ReactNode;
}

export function ShellLayout({ leftPanel, children }: ShellLayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.leftPanel}>{leftPanel}</div>
        <div className={styles.main}>{children}</div>
      </div>
    </div>
  );
}
