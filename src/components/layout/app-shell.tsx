"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Menu,
  Book,
  ShoppingCart,
  Mountain,
  FileText,
  CircleUser,
  Landmark,
  ShieldCheck,
  History,
  Wallet,
  Sparkles,
  Bot,
  Scale,
  Calculator,
  ArrowLeft,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Activity,
  LogIn,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/icons";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/firebase";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const publicNavItems = [
  { href: "/", label: "Home", icon: Mountain },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingCart },
  { href: "/ledger", label: "Public Ledger", icon: Book },
  { href: "/calculator", label: "Carbon Calc", icon: Calculator },
];

const protectedRoutes = [
  "/profile", "/checkout",
  "/admin/dashboard", "/admin/projects", "/admin/credits", "/admin/ai-validation",
  "/developer/dashboard", "/developer/projects", "/developer/edit-project",
  "/buyer/dashboard", "/buyer/history",
  "/ai-assistant", "/ndc",
];

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Approve Projects", icon: ShieldCheck },
  { href: "/admin/credits", label: "Issue Credits", icon: Landmark },
];

const developerNavItems = [
  { href: "/developer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/developer/projects", label: "My Projects", icon: FileText },
];

const buyerNavItems = [
  { href: "/buyer/dashboard", label: "My Dashboard", icon: Wallet },
  { href: "/buyer/history", label: "Claim History", icon: History },
];

const aiNavItems = [
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/admin/ai-validation", label: "AI Validation", icon: Sparkles },
];

const complianceNavItems = [
  { href: "/ndc", label: "NDC Tracking", icon: Scale },
];

function LiveIndicator() {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
      <span className="live-dot" />
      Live
    </span>
  );
}

function NavSection({
  title,
  items,
  collapsed,
  pathname,
  onNavClick,
}: {
  title?: string;
  items: typeof publicNavItems;
  collapsed: boolean;
  pathname: string;
  onNavClick?: () => void;
}) {
  return (
    <div className="mb-0.5">
      {title && !collapsed && (
        <p className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-widest uppercase text-white/25 select-none">
          {title}
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavClick}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white/85"
                )}
              >
                <item.icon
                  className={cn(
                    "h-[17px] w-[17px] shrink-0 transition-colors",
                    isActive ? "text-emerald-400" : "text-white/35 group-hover:text-emerald-400"
                  )}
                />
                {!collapsed && <span className="truncate leading-none">{item.label}</span>}
                {isActive && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SidebarDivider({ collapsed }: { collapsed: boolean }) {
  return <div className={cn("my-1.5 border-t border-white/8", collapsed && "mx-2")} />;
}

function SidebarContent({
  collapsed,
  pathname,
  user,
  onNavClick,
  showSection,
}: {
  collapsed: boolean;
  pathname: string;
  user: ReturnType<typeof useUser>["user"];
  onNavClick?: () => void;
  showSection: (s: string) => boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-white/8",
          collapsed ? "justify-center px-3" : "px-4 gap-3"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavClick}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/25">
            <BrandLogo className="h-5 w-5 text-emerald-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-white tracking-tight">BCX</span>
              <span className="text-[9px] text-white/35 tracking-widest uppercase">Carbon Exchange</span>
            </div>
          )}
        </Link>
        {!collapsed && <LiveIndicator />}
      </div>

      <nav className="flex-1 overflow-y-auto p-2.5">
        {showSection("Public") && (
          <NavSection title="Public" items={publicNavItems} collapsed={collapsed} pathname={pathname} onNavClick={onNavClick} />
        )}
        {showSection("Buyer / Corporate") && (
          <>
            <SidebarDivider collapsed={collapsed} />
            <NavSection title="Buyer" items={buyerNavItems} collapsed={collapsed} pathname={pathname} onNavClick={onNavClick} />
          </>
        )}
        {showSection("Project Developer") && (
          <>
            <SidebarDivider collapsed={collapsed} />
            <NavSection title="Developer" items={developerNavItems} collapsed={collapsed} pathname={pathname} onNavClick={onNavClick} />
          </>
        )}
        {showSection("Admin / Registry") && (
          <>
            <SidebarDivider collapsed={collapsed} />
            <NavSection title="Admin" items={adminNavItems} collapsed={collapsed} pathname={pathname} onNavClick={onNavClick} />
          </>
        )}
        {showSection("AI Tools") && (
          <>
            <SidebarDivider collapsed={collapsed} />
            <NavSection title="AI Tools" items={aiNavItems} collapsed={collapsed} pathname={pathname} onNavClick={onNavClick} />
          </>
        )}
        {showSection("Compliance") && (
          <>
            <SidebarDivider collapsed={collapsed} />
            <NavSection title="Compliance" items={complianceNavItems} collapsed={collapsed} pathname={pathname} onNavClick={onNavClick} />
          </>
        )}
      </nav>

      {user && (
        <div className="shrink-0 border-t border-white/8 p-2.5">
          <Link
            href="/profile"
            onClick={onNavClick}
            title={collapsed ? "Profile" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
              pathname === "/profile"
                ? "bg-white/10 text-white"
                : "text-white/50 hover:bg-white/[0.06] hover:text-white/85"
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30">
              <CircleUser className="h-4 w-4 text-emerald-400" />
            </div>
            {!collapsed && (
              <span className="truncate text-xs font-medium">{user.email?.split("@")[0] ?? "Profile"}</span>
            )}
          </Link>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { cart, setIsCartOpen } = useCart();
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = sessionStorage.getItem("userRole") as UserRole;
      if (storedRole) setUserRole(storedRole);
    }
  }, [user]);

  React.useEffect(() => {
    if (isUserLoading) return;
    const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
    if (!user && isProtectedRoute) {
      if (typeof window !== "undefined") sessionStorage.removeItem("userRole");
      setUserRole(null);
      router.push("/login");
      return;
    }
    const storedRole = typeof window !== "undefined" ? sessionStorage.getItem("userRole") : null;
    if (user && pathname.startsWith("/admin") && storedRole !== "ADMIN") {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to access the admin panel.",
      });
      router.push("/");
    }
  }, [user, isUserLoading, pathname, router, toast]);

  const showSection = (title: string) => {
    if (!user) return title === "Public";
    if (userRole === "ADMIN") return ["Public", "Admin / Registry", "AI Tools", "Compliance"].includes(title);
    if (userRole === "BUYER") return ["Public", "Buyer / Corporate", "AI Tools", "Compliance"].includes(title);
    if (userRole === "DEVELOPER") return ["Public", "Project Developer", "Compliance"].includes(title);
    return title === "Public";
  };

  const topLevelPaths = [
    "/", "/marketplace", "/ledger", "/calculator",
    "/admin/dashboard", "/admin/projects", "/admin/credits",
    "/developer/dashboard", "/developer/projects",
    "/buyer/dashboard", "/buyer/history",
    "/ai-assistant", "/ndc", "/login", "/signup",
  ];
  const showBackButton = !topLevelPaths.includes(pathname);

  const allNavItems = [...publicNavItems, ...adminNavItems, ...developerNavItems, ...buyerNavItems, ...aiNavItems, ...complianceNavItems];
  const currentPage =
    allNavItems.find((item) => item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) ||
    (pathname.startsWith("/login") ? { label: "Login" } : null) ||
    (pathname.startsWith("/signup") ? { label: "Sign Up" } : null) ||
    (pathname.startsWith("/profile") ? { label: "Profile" } : null) ||
    (pathname.startsWith("/checkout") ? { label: "Checkout" } : null) ||
    (pathname.startsWith("/ndc/") ? { label: "NDC Project" } : null) ||
    (pathname.startsWith("/admin/review/") ? { label: "Review Project" } : null) ||
    { label: "Home" };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <BrandLogo className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground tracking-wide">Loading BCX…</p>
        </div>
      </div>
    );
  }

  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  const sidebarBg = "hsl(222, 47%, 8%)";
  const sidebarBorder = "hsl(222, 47%, 14%)";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "relative hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out border-r",
          isSidebarOpen ? "w-60" : "w-[68px]"
        )}
        style={{ backgroundColor: sidebarBg, borderColor: sidebarBorder }}
      >
        <SidebarContent
          collapsed={!isSidebarOpen}
          pathname={pathname}
          user={user}
          showSection={showSection}
        />
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "absolute -right-2.5 top-[52px] z-30 flex h-5 w-5 items-center justify-center rounded-full",
            "bg-[hsl(222,47%,14%)] border border-white/10 text-white/40",
            "hover:text-emerald-400 hover:border-emerald-500/40 transition-all duration-200 shadow-lg"
          )}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
      </aside>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-5">
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-72 border-r"
              style={{ backgroundColor: sidebarBg, borderColor: sidebarBorder }}
            >
              <SidebarContent
                collapsed={false}
                pathname={pathname}
                user={user}
                showSection={showSection}
                onNavClick={() => setIsMobileSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>

          {showBackButton && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Go back</span>
            </Button>
          )}

          <div className="flex flex-1 items-center gap-2 min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">{currentPage?.label}</h1>
            <span className="hidden md:flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 rounded-full px-2 py-0.5 tracking-wide">
              <Activity className="h-2.5 w-2.5" />
              LIVE
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cart.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-[10px] leading-none"
                    >
                      {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </Badge>
                  )}
                  <span className="sr-only">Open Cart</span>
                </Button>
                <Link href="/profile">
                  <button className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-200 dark:ring-emerald-800/60 hover:ring-emerald-400 transition-all">
                    <CircleUser className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  </button>
                </Link>
              </>
            ) : (
              <Button asChild size="sm" className="ml-1 h-8 text-xs gap-1.5">
                <Link href="/login">
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
