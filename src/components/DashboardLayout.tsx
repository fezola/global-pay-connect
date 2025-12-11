import { ReactNode } from "react";
import { LeftNav } from "./LeftNav";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isOnboarded } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <LeftNav />
      <main className="flex-1 lg:pl-0 pl-0">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
