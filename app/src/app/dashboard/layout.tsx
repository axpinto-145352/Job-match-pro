"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiHome,
  FiUser,
  FiDownload,
  FiCreditCard,
  FiTrendingUp,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <FiHome size={20} /> },
  { label: "Profiles", href: "/dashboard/profiles", icon: <FiUser size={20} /> },
  { label: "Export", href: "/dashboard/export", icon: <FiDownload size={20} /> },
  { label: "Billing", href: "/dashboard/billing", icon: <FiCreditCard size={20} /> },
  {
    label: "Marketing",
    href: "/dashboard/marketing",
    icon: <FiTrendingUp size={20} />,
    adminOnly: true,
  },
];

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------
function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userInitial = userName.charAt(0).toUpperCase();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-border h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
              JM
            </div>
            <span className="font-semibold text-foreground text-sm">
              JobMatch Pro
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
              JM
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={`text-muted hover:text-foreground transition-colors ${
            collapsed ? "hidden" : ""
          }`}
          aria-label="Collapse sidebar"
        >
          <FiChevronLeft size={18} />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="flex items-center justify-center py-3 text-muted hover:text-foreground transition-colors"
          aria-label="Expand sidebar"
        >
          <FiChevronRight size={18} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly) return null; // hide admin-only for now
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-surface hover:text-foreground"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={userName}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              userInitial
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-muted truncate">{userEmail}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-muted hover:text-danger transition-colors flex-shrink-0"
              title="Logout"
            >
              <FiLogOut size={18} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-2 w-full flex items-center justify-center text-muted hover:text-danger transition-colors"
            title="Logout"
          >
            <FiLogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Mobile bottom navigation
// ---------------------------------------------------------------------------
function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.filter((i) => !i.adminOnly).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Mobile header
// ---------------------------------------------------------------------------
function MobileHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const userName = session?.user?.name ?? "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
            JM
          </div>
          <span className="font-semibold text-foreground text-sm">
            JobMatch Pro
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-xs">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              userInitial
            )}
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-muted hover:text-foreground"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>
      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-border bg-white px-4 py-3 space-y-2">
          <div className="text-sm text-foreground font-medium">{userName}</div>
          <div className="text-xs text-muted">{session?.user?.email}</div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-sm text-danger hover:underline mt-2"
          >
            <FiLogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Inner layout (requires session)
// ---------------------------------------------------------------------------
function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root layout with SessionProvider
// ---------------------------------------------------------------------------
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  );
}
