
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, BedDouble, LogOut, UserCircle, LayoutDashboard, Building, ShieldCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { CurrentUser } from '@/lib/types'; // Import consolidated type

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsClient(true); 
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing currentUser from localStorage", e);
        localStorage.removeItem('currentUser'); 
      }
    } else {
      setCurrentUser(null);
    }
  }, [pathname]); 

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    router.push('/');
    setIsSheetOpen(false); 
  };

  const baseNavItems = [
    { label: 'Home', href: '/' },
    { label: 'Explore Hotels', href: '/explore' },
  ];

  const ownerNavItem = { label: 'List your property', href: '/register-hotel', icon: <Building size={18} className="mr-1.5"/> };
  const ownerDashboardItem = { label: 'My Dashboard', href: '/dashboard/owner', icon: <LayoutDashboard size={18} className="mr-1.5"/> };
  const adminDashboardItem = { label: 'Admin Panel', href: '/admin/dashboard', icon: <ShieldCheck size={18} className="mr-1.5"/> };

  const getNavItems = () => {
    let items = [...baseNavItems];
    if (currentUser?.role === 'admin') {
      items.push(adminDashboardItem);
      // Admins can also see owner items if desired, or have a completely separate view.
      // For now, let's assume admin also gets owner links for convenience in local dev.
      items.push(ownerDashboardItem);
      items.push(ownerNavItem);
    } else if (currentUser?.role === 'owner') {
      items.push(ownerDashboardItem);
      items.push(ownerNavItem); 
    } else if (!currentUser) {
      // Not logged in, show "List your property" (page itself will handle auth check)
      items.push(ownerNavItem);
    }
    // If currentUser exists and role is 'booker', ownerNavItem is NOT added.
    return items;
  };
  
  const navItems = getNavItems();

  if (!isClient) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BedDouble className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">Hotel Connector</span>
          </Link>
          <div className="h-8 w-24 bg-muted rounded animate-pulse md:hidden"></div>
          <nav className="hidden md:flex items-center gap-2">
            <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-28 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BedDouble className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">Hotel Connector</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button key={item.label} variant="ghost" asChild>
              <Link href={item.href}>{item.icon}{item.label}</Link>
            </Button>
          ))}
          {currentUser ? (
            <>
              <span className="text-sm text-muted-foreground mx-2 hidden lg:inline">Hi, {currentUser.fullName.split(' ')[0]}! ({currentUser.role})</span>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut size={18} className="mr-1.5" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[320px] p-6 flex flex-col">
              <nav className="flex flex-col gap-3 mt-8 flex-grow">
                {currentUser && (
                  <div className="px-2 py-3 border-b mb-3">
                      <div className="flex items-center gap-2">
                          <UserCircle size={28} className="text-primary"/>
                          <div>
                              <p className="font-semibold">{currentUser.fullName}</p>
                              <p className="text-xs text-muted-foreground">{currentUser.email} ({currentUser.role})</p>
                          </div>
                      </div>
                  </div>
                )}
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center px-2 py-2 text-lg hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    >
                      {item.icon}{item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto pt-4 border-t">
                {currentUser ? (
                   <Button onClick={handleSignOut} className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
                     <LogOut size={18} className="mr-2" /> Sign Out
                   </Button>
                ) : (
                  <div className="space-y-3">
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/signin">Sign In</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
