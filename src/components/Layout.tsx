import { Link, useLocation } from 'react-router-dom';
import {
  Leaf,
  Warehouse,
  Store,
  BarChart3,
  ClipboardCheck,
  Menu,
  X,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: BarChart3, description: 'Dashboard & Analytics' },
  { path: '/farmer', label: 'Farmer', icon: Leaf, description: 'Intake & Processing' },
  { path: '/grading', label: 'Quality', icon: ClipboardCheck, description: 'Quality Control' },
  { path: '/warehouse', label: 'Warehouse', icon: Warehouse, description: 'Inventory Management' },
  { path: '/retailer', label: 'Retailer', icon: Store, description: 'Retail Operations' },
  { path: '/customer', label: 'Traceability', icon: User, description: 'Customer & Tracking' },
  { path: '/reports', label: 'Reports', icon: FileText, description: 'Analytics & Reports' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Enhanced Floating Navbar */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none transition-all duration-500 ease-out",
        scrolled ? "top-2" : "top-6",
        navCollapsed && "-translate-y-20 opacity-0"
      )}>
        <header className={cn(
          "w-full max-w-7xl rounded-2xl glass-strong px-6 py-4 flex items-center justify-between pointer-events-auto transition-all duration-500 ease-out shadow-xl",
          scrolled && "py-3 shadow-2xl backdrop-blur-xl",
          navCollapsed && "max-w-fit px-4"
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-primary/40">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className={cn(
              "overflow-hidden transition-all duration-500 ease-out",
              navCollapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"
            )}>
              <span className="text-xl font-bold tracking-tight text-gradient whitespace-nowrap">
                AgroVia
              </span>
              <div className="text-xs text-muted-foreground font-medium">
                Supply Chain Platform
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className={cn(
            "hidden lg:flex items-center gap-1 overflow-hidden transition-all duration-500 ease-out",
            navCollapsed ? "max-w-0 opacity-0" : "max-w-[900px] opacity-100"
          )}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'group relative px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                  title={item.description}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-xl shadow-lg shadow-primary/25 transition-all duration-300" />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className={cn(
                      "h-4 w-4 transition-all duration-300",
                      isActive ? "text-white" : "group-hover:scale-110"
                    )} />
                    <span className="hidden xl:inline">{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className={cn(
              "overflow-hidden transition-all duration-500 ease-out",
              navCollapsed ? "max-w-0 opacity-0" : "max-w-[100px] opacity-100"
            )}>
              <NotificationCenter />
            </div>

            {/* Help Button */}
            <div className={cn(
              "overflow-hidden transition-all duration-500 ease-out",
              navCollapsed ? "max-w-0 opacity-0" : "max-w-[100px] opacity-100"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-secondary/50 transition-all duration-300 hover:scale-110"
                title="Help & Support"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>

            {/* Theme Toggle */}
            <div className={cn(
              "overflow-hidden transition-all duration-500 ease-out",
              navCollapsed ? "max-w-0 opacity-0" : "max-w-[100px] opacity-100"
            )}>
              <ThemeToggle />
            </div>

            {/* Collapse/Expand Button - Desktop */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex rounded-xl hover:bg-secondary/50 transition-all duration-300 hover:scale-110"
              onClick={() => setNavCollapsed(!navCollapsed)}
              title={navCollapsed ? "Expand Menu" : "Collapse Menu"}
            >
              {navCollapsed ? (
                <ChevronRight className="h-5 w-5 transition-transform duration-300" />
              ) : (
                <ChevronLeft className="h-5 w-5 transition-transform duration-300" />
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl hover:bg-secondary/50 transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>
      </div>

      {/* Show Navbar Button - appears when navbar is collapsed */}
      {navCollapsed && (
        <Button
          variant="gradient"
          size="sm"
          className="fixed top-4 right-4 z-50 rounded-xl shadow-xl animate-fade-in-down"
          onClick={() => setNavCollapsed(false)}
        >
          <Menu className="h-4 w-4 mr-2" />
          Show Menu
        </Button>
      )}

      {/* Enhanced Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu */}
          <div className="fixed top-24 left-4 right-4 z-50 lg:hidden animate-fade-in-up max-h-[calc(100vh-8rem)] overflow-y-auto">
            <nav className="glass-strong rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'group flex items-center gap-4 px-4 py-4 text-base font-medium rounded-2xl transition-all duration-300 active:scale-95',
                        isActive
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-xl transition-all duration-300",
                        isActive 
                          ? "bg-white/20" 
                          : "bg-secondary group-hover:bg-secondary/80"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{item.label}</div>
                        <div className={cn(
                          "text-xs font-medium",
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Main Content with Enhanced Spacing */}
      <main className={cn(
        "relative z-10 container max-w-7xl animate-fade-in-up min-h-screen px-4 sm:px-6",
        scrolled ? "pt-28 pb-16" : "pt-36 pb-16"
      )}>
        {children}
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-border/50 bg-secondary/20 backdrop-blur-sm py-12 mt-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-xl flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-foreground">AgroVia</div>
                <div className="text-xs text-muted-foreground">Supply Chain Platform</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
            
            <div className="text-sm text-muted-foreground">
              &copy; 2026 AgroVia Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
