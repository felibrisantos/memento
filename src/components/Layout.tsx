import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Film, Tv, Disc3, BookOpen, Library, Menu, X, LogOut, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollection } from '../hooks/useCollection';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Library', icon: Library },
  { path: '/movies', label: 'Film', icon: Film },
  { path: '/tvshows', label: 'TV', icon: Tv },
  { path: '/albums', label: 'Music', icon: Disc3 },
  { path: '/books', label: 'Books', icon: BookOpen },
];

export default function Layout() {
  const { totalCount } = useCollection();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 1024);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change (mobile)
  function handleNavClick() {
    if (isMobile) setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-5 left-5 z-[60] p-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-text-muted hover:text-accent transition-colors"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}

      {/* Backdrop */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-void/60 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <nav
        className={`fixed left-0 top-0 bottom-0 w-[220px] border-r border-border flex flex-col z-50 transition-transform duration-300 ${
          isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
        style={{ background: 'linear-gradient(180deg, #0e0e0e 0%, #0a0a0a 100%)' }}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-10">
          <h1 className="font-display text-3xl text-accent tracking-tight">
            MEMENTO
          </h1>
          <p className="text-[10px] font-mono text-text-dim tracking-[0.3em] mt-1 uppercase">
            Personal archive
          </p>
        </div>

        {/* Nav Links */}
        <div className="flex-1 px-3">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium tracking-wide transition-all duration-200 mb-1 group ${
                  isActive
                    ? 'bg-accent-glow text-accent'
                    : 'text-text-muted hover:text-text hover:bg-card'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto w-1 h-1 rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Stats */}
        <div className="px-6 pb-8">
          <div className="border-t border-border pt-5">
            <p className="text-[10px] font-mono text-text-dim tracking-[0.2em] uppercase mb-2">
              Archived items
            </p>
            <p className="font-display text-4xl text-text">{totalCount}</p>
          </div>

          {/* User / Logout */}
          <div className="border-t border-border mt-5 pt-4">
            <p className="text-[10px] font-mono text-text-dim tracking-wider truncate mb-3">
              {user?.email}
            </p>
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-[11px] font-mono text-text-dim hover:text-red transition-colors tracking-wider uppercase"
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${isMobile ? 'ml-0' : 'ml-[220px]'}`}>
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
    </div>
  );
}
