"use client";

import { motion } from "framer-motion";
import { Sparkles, User, LogOut, Search, LayoutDashboard, Network } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { Link, useNavigate, useLocation } from "@remix-run/react";
import supabase from "~/lib/supabase.client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AppNavProps {
  user: SupabaseUser;
}

export function AppNav({ user }: AppNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Search", href: "/search", icon: Search },
    { name: "Knowledge Canvas", href: "/knowledge-canvas", icon: Network },
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
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">DelphiX</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive 
                          ? "bg-white/[0.08] text-white border border-white/[0.12]" 
                          : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                  <User className="h-3.5 w-3.5 text-white/60" />
                  <span className="text-sm text-white/80">{displayName}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className={cn(
                    "p-1.5 rounded-lg text-white/60 hover:text-white",
                    "hover:bg-white/[0.05] transition-all"
                  )}
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 