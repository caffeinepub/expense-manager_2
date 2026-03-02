import { Link, Outlet, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  PlusCircle,
  IndianRupee,
  Menu,
  X,
  Heart,
  Home,
  LogIn,
  LogOut,
  User,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/add-expense', label: 'Add Expense', icon: PlusCircle },
];

function ProfileSetupModal({ onSave }: { onSave: (name: string) => void; isSaving: boolean }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    onSave(name.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-card-lg p-8 w-full max-w-sm mx-4 animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center mb-4">
            <User className="w-7 h-7 text-gold" />
          </div>
          <h2 className="font-display font-bold text-xl text-foreground">Welcome!</h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Tell us your name to get started with ExpenseTrack.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-sm font-semibold">
              Your Name
            </Label>
            <Input
              id="profile-name"
              placeholder="e.g., Rahul Sharma"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="h-11 focus-visible:ring-gold"
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-gold text-charcoal hover:bg-gold-dark font-semibold h-11 shadow-gold-glow"
          >
            Get Started
          </Button>
        </form>
      </div>
    </div>
  );
}

function AuthButton({ compact }: { compact?: boolean }) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message === 'User is already authenticated'
        ) {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleAuth}
        disabled={isLoggingIn}
        title={isAuthenticated ? 'Logout' : 'Login'}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-sidebar-muted hover:text-sidebar-fg hover:bg-charcoal-lighter disabled:opacity-50"
      >
        {isLoggingIn ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isAuthenticated ? (
          <LogOut className="w-4 h-4" />
        ) : (
          <LogIn className="w-4 h-4" />
        )}
        <span>{isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAuth}
      disabled={isLoggingIn}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-50 ${
        isAuthenticated
          ? 'bg-charcoal-lighter text-sidebar-fg hover:bg-charcoal-lighter/80'
          : 'bg-gold text-charcoal hover:bg-gold-dark shadow-gold-glow'
      }`}
    >
      {isLoggingIn ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isAuthenticated ? (
        <LogOut className="w-4 h-4" />
      ) : (
        <LogIn className="w-4 h-4" />
      )}
      {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
    </button>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile } = useGetCallerUserProfile();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center shadow-gold-glow flex-shrink-0">
          <IndianRupee className="w-5 h-5 text-charcoal" />
        </div>
        <div>
          <h1 className="font-display font-bold text-sidebar-fg text-lg leading-tight">
            ExpenseTrack
          </h1>
          <p className="text-xs text-sidebar-muted">Personal Finance</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-sidebar-muted hover:text-sidebar-fg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      {isAuthenticated && userProfile && (
        <div className="px-6 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-gold" />
            </div>
            <span className="text-sm font-medium text-sidebar-fg truncate">
              {userProfile.name}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <p className="text-xs font-semibold text-sidebar-muted uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive
                  ? 'bg-sidebar-activeBg text-gold font-semibold'
                  : 'text-sidebar-muted hover:text-sidebar-fg hover:bg-charcoal-lighter'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-gold' : 'text-sidebar-muted group-hover:text-sidebar-fg'
                }`}
              />
              <span className="text-sm">{label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Auth Section */}
      <div className="px-3 pb-3 border-t border-sidebar-border pt-3">
        <AuthButton compact />
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-muted text-center">
          © {new Date().getFullYear()} ExpenseTrack
        </p>
        <p className="text-xs text-sidebar-muted text-center mt-1 flex items-center justify-center gap-1">
          Built with <Heart className="w-3 h-3 text-gold fill-gold" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.hostname : 'expensetrack'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

function ProfileSetupGate({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const showProfileSetup = isAuthenticated && !isLoading && isFetched && userProfile === null;

  const handleSave = (name: string) => {
    saveProfile.mutate({ name });
  };

  return (
    <>
      {showProfileSetup && (
        <ProfileSetupModal onSave={handleSave} isSaving={saveProfile.isPending} />
      )}
      {children}
    </>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProfileSetupGate>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-charcoal border-r border-sidebar-border">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-charcoal border-r border-sidebar-border z-10">
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-charcoal border-b border-sidebar-border">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-sidebar-muted hover:text-sidebar-fg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-lg bg-gold flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-charcoal" />
              </div>
              <span className="font-display font-bold text-sidebar-fg">ExpenseTrack</span>
            </div>
            <AuthButton />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProfileSetupGate>
  );
}
