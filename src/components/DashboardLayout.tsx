import { ReactNode } from "react";
import { LeftNav } from "./LeftNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Authentication is handled by ProtectedRoute wrapper
  // No need to check here to avoid redirect loops

  return (
    <div className="min-h-screen flex w-full bg-background">
      <LeftNav />
      <main className="flex-1 lg:pl-0 pl-0">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
