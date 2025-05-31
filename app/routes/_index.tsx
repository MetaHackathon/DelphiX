import type { MetaFunction } from "@remix-run/node";
import { HeroGeometric } from "~/components/ui/shape-landing-hero";
import { motion } from "framer-motion";
import { ArrowRight, Search, Network, MessageCircle, Sparkles, Brain, FileText, Users, BookOpen } from "lucide-react";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "DelphiX - AI-Powered Research Discovery Platform" },
    {
      name: "description",
      content: "Discover, analyze, and connect research papers with AI-powered insights. Transform how you explore academic literature.",
    },
  ];
};

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: any;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 + delay, ease: [0.25, 0.4, 0.25, 1] }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-rose-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl p-8 hover:bg-white/[0.04] transition-all duration-300">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-lg">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        <p className="text-white/60 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function SearchInterface() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      // Navigate to knowledge canvas with demo results
      window.location.href = '/knowledge-canvas';
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative max-w-3xl mx-auto"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-rose-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative flex items-center">
          <Search className="absolute left-6 text-white/40 h-5 w-5" />
          <input
            type="text"
            placeholder="Search papers, authors, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full pl-14 pr-32 py-5 text-lg rounded-2xl",
              "bg-white/[0.05] backdrop-blur-sm border border-white/[0.1]",
              "text-white placeholder:text-white/40",
              "focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.2]",
              "transition-all duration-300"
            )}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className={cn(
              "absolute right-3 px-6 py-3 rounded-xl",
              "bg-gradient-to-r from-indigo-500 to-rose-500",
              "text-white font-medium",
              "hover:shadow-lg hover:shadow-indigo-500/25",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-300"
            )}
          >
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-6 text-sm">
        <span className="text-white/40">Try:</span>
        {["transformer architecture", "attention mechanism", "BERT"].map((term) => (
          <button
            key={term}
            onClick={() => setSearchQuery(term)}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function Index() {
  const features = [
    {
      icon: Search,
      title: "Smart Discovery",
      description: "Search through millions of research papers with AI-powered semantic understanding.",
    },
    {
      icon: Network,
      title: "Knowledge Canvas",
      description: "Visualize connections between papers and explore research landscapes interactively with ReactFlow.",
    },
    {
      icon: MessageCircle,
      title: "Paper Agents",
      description: "Chat with AI assistants that have deep understanding of specific research papers.",
    },
    {
      icon: Brain,
      title: "AI Insights",
      description: "Get automated summaries, key findings, and research implications instantly.",
    },
    {
      icon: Users,
      title: "Collaborative Research",
      description: "Share insights and collaborate with researchers worldwide in real-time.",
    },
    {
      icon: Sparkles,
      title: "Citation Networks",
      description: "Explore citation relationships and discover influential papers in your field.",
    },
  ];

  const stats = [
    { value: "2M+", label: "Research Papers" },
    { value: "500K+", label: "Active Researchers" },
    { value: "50K+", label: "Institutions" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="min-h-screen bg-[#030303]">
      <HeroGeometric
        badge="AI Research Platform"
        title1="Discover Research"
        title2="Powered by AI"
      />

      {/* Search Section */}
      <section className="relative -mt-40 pb-20 px-4">
        <div className="relative container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                Start Your Research Journey
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-white/40 max-w-2xl mx-auto"
            >
              Search through millions of papers with AI-powered semantic understanding
            </motion.p>
          </div>

          <SearchInterface />

          {/* Quick Access Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          >
            <Link to="/knowledge-canvas">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "group px-6 py-3 rounded-full font-medium",
                  "bg-white/[0.03] backdrop-blur-sm",
                  "border border-white/[0.08] text-white",
                  "hover:bg-white/[0.05] hover:border-white/[0.15]",
                  "transition-all duration-300",
                  "flex items-center gap-2"
                )}
              >
                <Network className="h-4 w-4" />
                Explore Knowledge Canvas
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "px-6 py-3 rounded-full font-medium",
                "bg-white/[0.03] backdrop-blur-sm",
                "border border-white/[0.08] text-white",
                "hover:bg-white/[0.05] hover:border-white/[0.15]",
                "transition-all duration-300",
                "flex items-center gap-2"
              )}
            >
              <FileText className="h-4 w-4" />
              Browse Papers
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-rose-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent" />
        
        <div className="relative container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                Powered by Advanced AI
              </span>
            </h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">
              Experience the future of research discovery with our cutting-edge AI capabilities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
                Ready to Accelerate Your Research?
              </span>
            </h2>
            <p className="text-lg text-white/40 mb-8 max-w-2xl mx-auto">
              Join thousands of researchers already using DelphiX to discover breakthrough insights
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "group px-8 py-4 rounded-full font-medium",
                  "bg-gradient-to-r from-indigo-500 to-rose-500",
                  "text-white shadow-lg shadow-indigo-500/25",
                  "hover:shadow-xl hover:shadow-indigo-500/30",
                  "transition-all duration-300",
                  "flex items-center gap-2 justify-center"
                )}
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-8 py-4 rounded-full font-medium",
                  "bg-white/[0.03] backdrop-blur-sm",
                  "border border-white/[0.08] text-white",
                  "hover:bg-white/[0.05] hover:border-white/[0.15]",
                  "transition-all duration-300"
                )}
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/[0.05]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/40 text-sm">
              © 2024 DelphiX. AI-powered research discovery platform.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-white/40 hover:text-white/60 transition-colors text-sm">
                Documentation
              </a>
              <a href="#" className="text-white/40 hover:text-white/60 transition-colors text-sm">
                API
              </a>
              <a href="#" className="text-white/40 hover:text-white/60 transition-colors text-sm">
                Research Blog
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
