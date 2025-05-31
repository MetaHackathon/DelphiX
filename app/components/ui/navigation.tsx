import { motion } from "framer-motion";
import { Sparkles, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { Link, useNavigate } from "@remix-run/react";
import supabase from "~/lib/supabase.client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface NavigationProps {
  user?: SupabaseUser | null;
}

export function Navigation({ user }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = user ? [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Search Papers", href: "/search" },
    { name: "Knowledge Canvas", href: "/knowledge-canvas" },
  ] : [
    { name: "Features", href: "/#features" },
    { name: "Search Demo", href: "/search" },
    { name: "Knowledge Canvas", href: "/knowledge-canvas" },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || user?.email;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-3 mt-3">
        <div className={cn(
          "backdrop-blur-md bg-white/[0.02] border border-white/[0.08]",
          "rounded-xl shadow-lg shadow-black/5"
        )}>
          <div className="px-4 py-2.5">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">DelphiX</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-white/60 hover:text-white transition-colors text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                      <User className="h-3.5 w-3.5 text-white/60" />
                      <span className="text-sm text-white/80">{displayName}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium",
                        "text-white/80 hover:text-white",
                        "hover:bg-white/[0.05] transition-all",
                        "flex items-center gap-1.5"
                      )}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/auth/signin"
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium",
                        "text-white/80 hover:text-white",
                        "hover:bg-white/[0.05] transition-all"
                      )}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/auth/signup"
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium",
                        "bg-gradient-to-r from-indigo-500 to-rose-500",
                        "text-white shadow-lg shadow-indigo-500/25",
                        "hover:shadow-xl hover:shadow-indigo-500/30",
                        "transition-all duration-300"
                      )}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-1.5 text-white/60 hover:text-white transition-colors"
              >
                {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden mt-3 pt-3 border-t border-white/[0.08]"
              >
                <div className="flex flex-col gap-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-white/60 hover:text-white transition-colors text-sm font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-2 mt-3">
                    {user ? (
                      <>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] w-full">
                          <User className="h-3.5 w-3.5 text-white/60" />
                          <span className="text-sm text-white/80">{displayName}</span>
                        </div>
                        <button
                          onClick={handleLogout}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium",
                            "text-white/80 hover:text-white",
                            "hover:bg-white/[0.05] transition-all",
                            "w-full flex items-center gap-1.5 justify-center"
                          )}
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/auth/signin"
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium",
                            "text-white/80 hover:text-white",
                            "hover:bg-white/[0.05] transition-all",
                            "w-full text-center"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/auth/signup"
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium",
                            "bg-gradient-to-r from-indigo-500 to-rose-500",
                            "text-white shadow-lg shadow-indigo-500/25",
                            "hover:shadow-xl hover:shadow-indigo-500/30",
                            "transition-all duration-300",
                            "w-full text-center"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          Get Started
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 