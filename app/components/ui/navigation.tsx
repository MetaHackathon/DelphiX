"use client";

import { motion } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { Link } from "@remix-run/react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Documentation", href: "/docs" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className={cn(
          "backdrop-blur-md bg-white/[0.02] border border-white/[0.08]",
          "rounded-2xl shadow-lg shadow-black/5"
        )}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-white">DelphiX</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
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
              <div className="hidden md:flex items-center gap-4">
                <button className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  "text-white/80 hover:text-white",
                  "hover:bg-white/[0.05] transition-all"
                )}>
                  Sign In
                </button>
                <button className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  "bg-gradient-to-r from-indigo-500 to-rose-500",
                  "text-white shadow-lg shadow-indigo-500/25",
                  "hover:shadow-xl hover:shadow-indigo-500/30",
                  "transition-all duration-300"
                )}>
                  Get Started
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden mt-4 pt-4 border-t border-white/[0.08]"
              >
                <div className="flex flex-col gap-4">
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
                  <div className="flex flex-col gap-2 mt-4">
                    <button className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium",
                      "text-white/80 hover:text-white",
                      "hover:bg-white/[0.05] transition-all",
                      "w-full"
                    )}>
                      Sign In
                    </button>
                    <button className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium",
                      "bg-gradient-to-r from-indigo-500 to-rose-500",
                      "text-white shadow-lg shadow-indigo-500/25",
                      "hover:shadow-xl hover:shadow-indigo-500/30",
                      "transition-all duration-300",
                      "w-full"
                    )}>
                      Get Started
                    </button>
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