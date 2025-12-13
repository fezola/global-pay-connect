import { Link, useLocation, useNavigate } from "react-router-dom";
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
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useEnvironmentMode } from "@/hooks/useEnvironmentMode";
import { EnvironmentModeSwitcher } from "@/components/EnvironmentModeSwitcher";

const mainNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { label: "Payouts", path: "/payouts", icon: Wallet },
  { label: "Payout Approvals", path: "/payout-approvals", icon: CheckCircle },
  { label: "Payout Schedules", path: "/payout-schedules", icon: Calendar },
  { label: "Payout Destinations", path: "/payout-destinations", icon: Wallet },
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
  { label: "Checkout Demo", path: "/checkout-demo", icon: Code, badge: "New" },
];

export function LeftNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { merchant } = useAppStore();
  const { signOut } = useAuth();
  const { mode, isTestMode } = useEnvironmentMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setMobileOpen(false);
    navigate('/auth');
  };

  const handleNavClick = () => {
    // Only close sidebar on mobile, not on desktop
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  };

  const renderNavItem = (item: { label: string; path: string; icon: any; badge?: string }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={handleNavClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
          collapsed && "justify-center"
        )}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-warning text-warning">
                {item.badge}
              </Badge>
            )}
          </>
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
          "fixed lg:static inset-y-0 left-0 z-40 bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200 overflow-y-auto border-r border-sidebar-border",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >

        <div className={cn("p-6 border-b border-sidebar-border", collapsed && "p-3")}>
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sidebar-primary-foreground font-bold text-sm">K</span>
              </div>
              {!collapsed && <span className="font-semibold text-lg">Klyr</span>}
            </Link>
            {/* Collapse button - Desktop only */}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex h-8 w-8 hover:bg-sidebar-accent"
                onClick={() => setCollapsed(!collapsed)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
          {merchant && !collapsed && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-sidebar-foreground/60 truncate">{merchant.name}</p>
              <EnvironmentModeSwitcher variant="badge-only" />
            </div>
          )}
          {/* Collapsed expand button */}
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8 hover:bg-sidebar-accent mt-3 mx-auto"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 py-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map(renderNavItem)}
          </div>

          {/* Business Section */}
          <div className="pt-4">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
                Business
              </p>
            )}
            {collapsed && <div className="h-px bg-sidebar-border my-2" />}
            <div className="space-y-1">
              {businessNavItems.map(renderNavItem)}
            </div>
          </div>

          {/* Advanced Section - Collapsible */}
          {!collapsed && (
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
          )}

          {/* Developer Section */}
          <div className="pt-4">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
                Developer
              </p>
            )}
            {collapsed && <div className="h-px bg-sidebar-border my-2" />}
            <div className="space-y-1">
              {devNavItems.map(renderNavItem)}
            </div>
          </div>
        </nav>

        <div className="p-3 mt-auto border-t border-sidebar-border">
          <Link
            to="/help"
            onClick={handleNavClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Help" : undefined}
          >
            <HelpCircle className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Help</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
