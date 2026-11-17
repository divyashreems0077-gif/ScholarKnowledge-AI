import React, { useState } from 'react';
import {
  Bookmark,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Compass,
  FilePlus2,
  GitCompare,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Users,
  X,
} from 'lucide-react';
import { AuthUser, PageRoute } from '../types/scholarship';
import { BrandLogo } from './StatusIndicator';

interface NavItem {
  route: PageRoute;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STUDENT_NAV_ITEMS: NavItem[] = [
  { route: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { route: 'student-profile', label: 'My Profile', icon: User },
  { route: 'explore-scholarships', label: 'Explore Scholarships', icon: Compass },
  { route: 'check-eligibility', label: 'Check Eligibility', icon: ClipboardCheck },
  { route: 'my-results', label: 'My Results', icon: ListChecks },
  { route: 'compare-scholarships', label: 'Compare Scholarships', icon: GitCompare },
  { route: 'ask-assistant', label: 'Ask ScholarKnowledge', icon: MessageSquareText },
  { route: 'saved-scholarships', label: 'Saved Scholarships', icon: Bookmark },
  { route: 'student-settings', label: 'Settings', icon: Settings },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { route: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { route: 'admin-manage', label: 'Manage Scholarships', icon: ListChecks },
  { route: 'admin-add', label: 'Add Scholarship', icon: FilePlus2 },
  { route: 'admin-rules', label: 'Eligibility Rules', icon: SlidersHorizontal },
  { route: 'admin-verification', label: 'Verification', icon: ShieldCheck },
  { route: 'admin-students', label: 'Student Overview', icon: Users },
];

interface AppShellProps {
  mode: 'student' | 'admin';
  currentRoute: PageRoute;
  breadcrumbTitle: string;
  user: AuthUser;
  onNavigate: (route: PageRoute) => void;
  onSwitchPortal: (targetMode: 'student' | 'admin') => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  mode,
  currentRoute,
  breadcrumbTitle,
  user,
  onNavigate,
  onSwitchPortal,
  onLogout,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = mode === 'admin' ? ADMIN_NAV_ITEMS : STUDENT_NAV_ITEMS;

  const isActive = (itemRoute: PageRoute) => {
    if (itemRoute === currentRoute) return true;
    if (itemRoute === 'explore-scholarships' && currentRoute === 'scholarship-details') return true;
    if (itemRoute === 'admin-manage' && currentRoute === 'admin-edit') return true;
    return false;
  };

  const renderSidebarLinks = (isMobile = false) => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
          {!collapsed || isMobile ? (
            <BrandLogo onClick={() => onNavigate(mode === 'admin' ? 'admin-dashboard' : 'student-dashboard')} />
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="mx-auto w-8 h-8 rounded-lg bg-[#0F1E46] text-white flex items-center justify-center font-display text-xs font-bold cursor-pointer"
              title="Expand sidebar"
            >
              SK
            </button>
          )}

          {!isMobile && (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.route);
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => {
                  onNavigate(item.route);
                  if (isMobile) setMobileOpen(false);
                }}
                title={collapsed && !isMobile ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#0F1E46] text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F1E46]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
                {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-200 space-y-1">
        {(!collapsed || isMobile) && (
          <button
            type="button"
            onClick={() => {
              onSwitchPortal(mode === 'admin' ? 'student' : 'admin');
              if (isMobile) setMobileOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#1D4ED8] bg-[#1D4ED8]/8 hover:bg-[#1D4ED8]/15 transition-colors cursor-pointer whitespace-nowrap"
          >
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {mode === 'admin' ? 'Switch to Student Portal' : 'Switch to Admin Console'}
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 shrink-0 transition-[width] duration-200 ${
          collapsed ? 'w-[72px]' : 'w-[256px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{renderSidebarLinks(false)}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[272px] max-w-[85vw] bg-white h-full border-r border-slate-200 z-10">
            {renderSidebarLinks(true)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 whitespace-nowrap">
                {mode === 'admin' ? 'Administrator' : 'Student Portal'}
              </span>
              <span className="text-slate-300" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-[#0F1E46] truncate">{breadcrumbTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-[#0F1E46] whitespace-nowrap">
                {user.name}
              </span>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                {mode === 'admin' ? 'Administrator Mode' : user.email}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#0F1E46] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
