import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Settings,
  Code,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Building2,
  Shield,
  Users,
  CreditCard,
  UserPlus,
  Link2,
  BarChart3,
  Lock,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const mainNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { label: "Payouts", path: "/payouts", icon: Wallet },
  { label: "Customers", path: "/customers", icon: Users },
];

const businessNavItems = [
  { label: "Business", path: "/business", icon: Building2, badge: "Required" },
  { label: "Compliance", path: "/compliance", icon: Shield },
];

const advancedNavItems = [
  { label: "Billing & Plans", path: "/billing", icon: CreditCard },
  { label: "Team & Roles", path: "/team", icon: UserPlus },
  { label: "Integrations", path: "/integrations", icon: Link2 },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Security & Logs", path: "/security", icon: Lock },
];

const devNavItems = [
  { label: "Settings", path: "/settings", icon: Settings },
  { label: "Developer", path: "/dev", icon: Code },
];

export function LeftNav() {
  const location = useLocation();
  const { merchant, logout } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const renderNavItem = (item: { label: string; path: string; icon: any; badge?: string }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-warning text-warning">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200 overflow-y-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="font-semibold text-lg">Klyr</span>
          </Link>
          {merchant && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-xs text-sidebar-foreground/60 truncate">{merchant.name}</p>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  merchant.productionEnabled 
                    ? "border-success text-success" 
                    : "border-warning text-warning"
                )}
              >
                {merchant.productionEnabled ? "Live" : "Sandbox"}
              </Badge>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map(renderNavItem)}
          </div>

          {/* Business Section */}
          <div className="pt-4">
            <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Business
            </p>
            <div className="space-y-1">
              {businessNavItems.map(renderNavItem)}
            </div>
          </div>

          {/* Advanced Section - Collapsible */}
          <div className="pt-4">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors"
            >
              <span className="flex-1 text-left">Advanced</span>
              <ChevronDown className={cn("h-3 w-3 transition-transform", advancedOpen && "rotate-180")} />
            </button>
            {advancedOpen && (
              <div className="space-y-1 mt-1">
                {advancedNavItems.map(renderNavItem)}
              </div>
            )}
          </div>

          {/* Developer Section */}
          <div className="pt-4">
            <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Developer
            </p>
            <div className="space-y-1">
              {devNavItems.map(renderNavItem)}
            </div>
          </div>
        </nav>

        <div className="p-3 mt-auto border-t border-sidebar-border">
          <Link
            to="/help"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
          <button
            onClick={() => {
              logout();
              setMobileOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
