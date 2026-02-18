

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
  Users,
  CircleUser,
  Landmark,
  ShieldCheck,
  History,
  Wallet,
  Sparkles,
  Bot,
  Scale,
  BarChart,
  CreditCard,
  BookCheck,
  Globe,
  ThumbsUp,
  ThumbsDown,
  LogIn,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/icons";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUser } from "@/firebase";
import { useCart } from "@/context/CartContext";
import { Badge } from "../ui/badge";
import type { UserRole } from "@/lib/types";
import { SUPER_ADMIN_UID } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";


const publicNavItems = [
  { href: "/", label: "Home", icon: Mountain },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingCart },
  { href: "/ledger", label: "Public Ledger", icon: Book },
];

const protectedRoutes = [
  "/profile",
  "/checkout",
  "/admin/dashboard",
  "/admin/projects",
  "/admin/credits",
  "/admin/ai-validation",
  "/developer/dashboard",
  "/developer/projects",
  "/buyer/dashboard",
  "/buyer/history",
  "/ai-assistant",
  "/ndc",
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
]

const complianceNavItems = [
    { href: "/ndc", label: "NDC Tracking", icon: Scale },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { cart, setIsCartOpen } = useCart();
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const { toast } = useToast();


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = sessionStorage.getItem('userRole') as UserRole;
      if (storedRole) {
        setUserRole(storedRole);
      }
    }
  }, [user]);


  React.useEffect(() => {
    if (isUserLoading) return;

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = pathname.startsWith('/admin');

    if (!user && isProtectedRoute) {
      if(typeof window !== 'undefined') {
        sessionStorage.removeItem('userRole');
      }
      setUserRole(null);
      router.push('/login');
      return;
    }

    if (user && isAdminRoute && user.uid !== SUPER_ADMIN_UID) {
        toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You do not have permission to access the admin panel.",
        });
        router.push('/');
    }

  }, [user, isUserLoading, pathname, router, toast]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderNavLinks = (items: typeof publicNavItems, title?: string) => {
    const isVisible = () => {
      if (!user) return title === "Public";

      if (userRole === 'ADMIN') {
        // Super Admin Check
        if (user.uid !== SUPER_ADMIN_UID) return false;
        return ["Public", "Admin / Registry", "AI Tools", "Compliance"].includes(title || "");
      }
      if (userRole === 'BUYER') {
        return ["Public", "Buyer / Corporate", "AI Tools", "Compliance"].includes(title || "");
      }
      if (userRole === 'DEVELOPER') {
        return ["Public", "Project Developer", "Compliance"].includes(title || "");
      }
      return title === "Public";
    };

    if (!isVisible()) return null;

    return (
        <>
            {title && isSidebarOpen && <h4 className="px-3 py-2 text-xs font-semibold text-muted-foreground tracking-wider">{title}</h4>}
            {items.map((item) => (
                <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobileSheetOpen && setIsMobileSheetOpen(false)}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                    pathname === item.href && "bg-muted text-primary font-semibold"
                )}
                >
                <item.icon className="h-5 w-5" />
                <span
                    className={cn(
                    "transition-opacity duration-200",
                    !isSidebarOpen && "opacity-0 w-0"
                    )}
                >
                    {item.label}
                </span>
                </Link>
            ))}
            <div className="my-4 border-t border-border -mx-4"></div>
        </>
    );
  };

  const mobileRenderNavLinks = (items: typeof publicNavItems) => (
      items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setIsMobileSheetOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === item.href && "bg-muted text-primary"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))
  )

  const getMobileNavSections = () => {
    if (userRole === 'ADMIN' && user?.uid === SUPER_ADMIN_UID) {
        return (
            <>
                <AccordionItem value="public"><AccordionTrigger className="text-sm font-semibold">Public</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(publicNavItems)}</AccordionContent></AccordionItem>
                <AccordionItem value="admin"><AccordionTrigger className="text-sm font-semibold">Admin / Registry</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(adminNavItems)}</AccordionContent></AccordionItem>
                <AccordionItem value="ai-tools"><AccordionTrigger className="text-sm font-semibold">AI Tools</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(aiNavItems)}</AccordionContent></AccordionItem>
                <AccordionItem value="compliance"><AccordionTrigger className="text-sm font-semibold">Compliance</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(complianceNavItems)}</AccordionContent></AccordionItem>
            </>
        )
    }
    if (userRole === 'BUYER') {
        return (
            <>
                <AccordionItem value="public"><AccordionTrigger className="text-sm font-semibold">Public</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(publicNavItems)}</AccordionContent></AccordionItem>
                <AccordionItem value="buyer"><AccordionTrigger className="text-sm font-semibold">Buyer / Corporate</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(buyerNavItems)}</AccordionContent></AccordionItem>
                <AccordionItem value="ai-tools"><AccordionTrigger className="text-sm font-semibold">AI Tools</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(aiNavItems)}</AccordionContent></AccordionItem>
                <AccordionItem value="compliance"><AccordionTrigger className="text-sm font-semibold">Compliance</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(complianceNavItems)}</AccordionContent></AccordionItem>
            </>
        )
    }
    if (userRole === 'DEVELOPER') {
        return (
            <>
                <AccordionItem value="public"><AccordionTrigger className="text-sm font-semibold">Public</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(publicNavItems)}</AccordionContent></AccordionItem>
                <AccordionItem value="developer"><AccordionTrigger className="text-sm font-semibold">Project Developer</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(developerNavItems)}</AccordionContent></AccordionItem>
                <AccordionItem value="compliance"><AccordionTrigger className="text-sm font-semibold">Compliance</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(complianceNavItems)}</AccordionContent></AccordionItem>
            </>
        )
    }
    // Default for unauthenticated users
    return <AccordionItem value="public"><AccordionTrigger className="text-sm font-semibold">Public</AccordionTrigger><AccordionContent className="pl-2 space-y-1">{mobileRenderNavLinks(publicNavItems)}</AccordionContent></AccordionItem>
  }


  const allNavItems = [...publicNavItems, ...adminNavItems, ...developerNavItems, ...buyerNavItems, ...aiNavItems, ...complianceNavItems];
  const currentPage = allNavItems.find(item => pathname.startsWith(item.href) && (item.href === '/' ? pathname === '/' : true)) || 
                      (pathname.startsWith('/login') ? { label: 'Login' } : null) ||
                      (pathname.startsWith('/signup') ? { label: 'Sign Up' } : null) ||
                      (pathname.startsWith('/profile') ? { label: 'Profile' } : null) ||
                      (pathname.startsWith('/checkout') ? { label: 'Checkout' } : null) ||
                      (pathname.startsWith('/ndc/') ? { label: 'NDC Project Dashboard' } : null) ||
                      (pathname.startsWith('/admin/review/') ? { label: 'Review Project' } : null) ||
                      { label: 'Home' };

  if (isUserLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>
  }

  // Show only children for login/signup pages to avoid nested layouts
  if (pathname === '/login' || pathname === '/signup') {
    return <>{children}</>;
  }


  return (
    <div className="flex min-h-screen w-full bg-secondary/50">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrandLogo className="h-6 w-6 text-primary" />
            <span
              className={cn(
                "font-bold transition-opacity duration-200",
                !isSidebarOpen && "opacity-0 w-0"
              )}
            >
              BCX
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          {renderNavLinks(publicNavItems, "Public")}
          {renderNavLinks(buyerNavItems, "Buyer / Corporate")}
          {renderNavLinks(developerNavItems, "Project Developer")}
          {renderNavLinks(adminNavItems, "Admin / Registry")}
          {renderNavLinks(aiNavItems, "AI Tools")}
          {renderNavLinks(complianceNavItems, "Compliance")}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          {/* Desktop Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* Mobile Toggle */}
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-72">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <BrandLogo className="h-6 w-6 text-primary" />
                        <span className="font-bold">Bharat Carbon Exchange</span>
                    </Link>
                </div>
                 <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                    <Accordion type="multiple" defaultValue={['public']} className="w-full">
                        {getMobileNavSections()}
                    </Accordion>
                </nav>
                 <div className="mt-auto p-4 border-t">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileSheetOpen(false)}
                      className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                          pathname === "/profile" && "bg-muted text-primary"
                      )}
                    >
                      <CircleUser className="h-5 w-5" />
                       Profile
                    </Link>
                </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-xl">
              {currentPage?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {user ? (
                <>
                 <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0"
                    >
                      {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </Badge>
                  )}
                  <span className="sr-only">Open Cart</span>
                </Button>
                <Link href="/profile" passHref>
                    <Button variant="ghost" size="icon">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Profile</span>
                    </Button>
                </Link>
                </>
             ) : (
                <Button asChild>
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                    </Link>
                </Button>
             )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-secondary/30">
          {children}
        </main>
      </div>
    </div>
  );
}
