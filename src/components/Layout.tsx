import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useCollection } from "@/hooks/useCollection";
import {
  BookOpen,
  Disc3,
  Film,
  Library,
  LogOut,
  Menu,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: "/", label: "Biblioteca", icon: Library },
  { path: "/movies", label: "Filmes", icon: Film },
  { path: "/tvshows", label: "Séries", icon: Tv },
  { path: "/albums", label: "Música", icon: Disc3 },
  { path: "/books", label: "Livros", icon: BookOpen },
];

function SidebarContent({ onNavClick }: { onNavClick: () => void }) {
  const { totalCount } = useCollection();
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-7 pt-10 pb-12">
        <h1 className="font-display text-[2rem] text-gold tracking-tight leading-none">
          MEMENTO
        </h1>
        <p className="text-sm font-mono text-text-muted tracking-[0.25em] mt-2 uppercase">
          Arquivo pessoal
        </p>
      </div>

      {/* Nav Links */}
      <div className="flex-1 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-lg text-base font-medium tracking-wide transition-all duration-200 mb-0.5 group ${
                isActive
                  ? "bg-gold-glow text-gold"
                  : "text-text-muted hover:text-text hover:bg-card"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-gold"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Stats */}
      <div className="px-7 pb-10">
        <Separator className="mb-6" />
        <p className="text-sm font-mono text-text-muted tracking-[0.2em] uppercase mb-3">
          Itens arquivados
        </p>
        <p className="font-display text-5xl text-text">{totalCount}</p>

        {/* User / Logout */}
        <Separator className="my-5" />
        <p className="text-sm font-mono text-text-muted tracking-wider truncate mb-4">
          {user?.email}
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="flex items-center gap-2.5 text-text-muted hover:text-red font-mono text-sm tracking-wider uppercase"
            >
              <LogOut size={14} />
              Sair
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sair da sua conta</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 1024);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function handleNavClick() {
    if (isMobile) setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`fixed top-5 left-5 z-[60] bg-card/90 backdrop-blur-sm border border-border transition-opacity duration-200 ${sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
              aria-label="Alternar navegação"
            >
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[260px] p-0 bg-sidebar border-r border-sidebar-border"
          >
            <SidebarContent onNavClick={handleNavClick} />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <nav
          className="fixed left-0 top-0 bottom-0 w-[260px] border-r border-border flex flex-col z-50"
          style={{
            background: "linear-gradient(180deg, #0e0e0e 0%, #0a0a0a 100%)",
          }}
        >
          <SidebarContent onNavClick={() => {}} />
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen ml-0 lg:ml-[260px] transition-all duration-300">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
    </div>
  );
}
