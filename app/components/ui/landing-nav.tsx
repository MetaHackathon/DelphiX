"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import { Link } from "@remix-run/react";

export function LandingNav() {
  const navItems = [
    { name: "Features", href: "/#features" },
    { name: "Search Demo", href: "/search" },
    { name: "Knowledge Canvas", href: "/knowledge-canvas" },
  ];

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

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 