import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  FileText, 
  Brain, 
  Network, 
  Clock, 
  BookOpen, 
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { AuthGuard, useAuth } from "~/components/auth-guard";
import { useEffect, useState } from "react";
import supabase from "~/lib/supabase.client";
import { apiClient } from "~/lib/api";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - DelphiX" },
    { name: "description", content: "Your research dashboard and knowledge workspace" },
  ];
};

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [recentPapers, setRecentPapers] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [canvases, setCanvases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user stats from DataEngineX API
      try {
        const statsData = await apiClient.getLibraryStats();
        setStats(statsData);
      } catch (error) {
        console.log('API stats not available, using fallback:', error);
        // Fallback to supabase
        try {
          const { data: statsData } = await supabase.rpc('get_user_stats', { p_user_id: user.id });
          setStats(statsData || {});
        } catch (supabaseError) {
          console.log('Supabase stats not available:', supabaseError);
          setStats({});
        }
      }

      // Get recent papers from DataEngineX API
      try {
        const papersData = await apiClient.getLibrary();
        setRecentPapers(papersData.slice(0, 5)); // Get first 5 papers
      } catch (error) {
        console.log('API papers not available, using fallback:', error);
        // Fallback to supabase
        try {
          const { data: papersData } = await supabase
            .from('papers')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
          setRecentPapers(papersData || []);
        } catch (supabaseError) {
          console.log('Supabase papers not available:', supabaseError);
          setRecentPapers([]);
        }
      }

      // Get recent chat sessions (keep supabase for now)
      try {
        const { data: chatsData } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(3);
        setRecentChats(chatsData || []);
      } catch (error) {
        console.log('Chat sessions table not available:', error);
        setRecentChats([]);
      }

      // Get canvases (keep supabase for now)
      try {
        const { data: canvasesData } = await supabase
          .from('canvases')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(3);
        setCanvases(canvasesData || []);
      } catch (error) {
        console.log('Canvases table not available:', error);
        setCanvases([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Search Papers",
      description: "Find and discover research papers",
      icon: Search,
      href: "/search",
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Upload Paper",
      description: "Add a new paper to your library",
      icon: Plus,
      href: "/papers/upload",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Document Viewer",
      description: "View PDF with highlights & AI chat",
      icon: FileText,
      href: "/document/sample",
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Knowledge Canvas",
      description: "Manage your knowledge bases",
      icon: Network,
      href: "/knowledge-canvas",
      color: "from-purple-500 to-violet-500",
    },
    {
      title: "Start Chat",
      description: "Chat with your papers",
      icon: Brain,
      href: "/chat",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030303] pt-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-left"
        >
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome back, {user?.user_metadata?.full_name || user?.email}
          </h1>
          <p className="text-white/60 text-lg">
            Start your research journey with AI-powered discovery
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Papers</p>
                  <p className="text-xl font-semibold text-white">
                    {stats.total_papers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Brain className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Concepts</p>
                  <p className="text-xl font-semibold text-white">
                    {stats.total_concepts || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Network className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Connections</p>
                  <p className="text-xl font-semibold text-white">
                    {stats.total_connections || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <BookOpen className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Annotations</p>
                  <p className="text-xl font-semibold text-white">
                    {stats.total_annotations || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={action.title} to={action.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <Card className="bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300 h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "p-2 rounded-lg bg-gradient-to-r",
                          action.color,
                          "bg-opacity-20"
                        )}>
                          <action.icon className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-medium text-white">{action.title}</h3>
                      </div>
                      <p className="text-sm text-white/60">{action.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Uploads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Uploads
                </CardTitle>
                <CardDescription className="text-white/60">
                  Your most recent PDF uploads
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentPapers.length > 0 ? (
                  <div className="space-y-3">
                    {recentPapers.slice(0, 3).map((paper) => (
                      <Link key={paper.id} to={`/papers/${paper.id}`} state={{ paper }} prefetch="intent">
                        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                          <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
                            {paper.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-white/60">
                              {Array.isArray(paper.authors) && paper.authors.length > 0 
                                ? paper.authors.slice(0, 2).join(", ")
                                : "Unknown authors"}
                            </p>
                            {paper.processing_status && (
                              <Badge variant="outline" className="text-xs border-white/[0.1] text-white/60">
                                {paper.processing_status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link to="/library">
                      <Button variant="ghost" className="w-full text-white/60 hover:text-white">
                        View All Papers
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-8 w-8 text-white/40 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">No papers yet</p>
                    <Link to="/search">
                      <Button variant="ghost" className="mt-2 text-indigo-400 hover:text-indigo-300">
                        Search Papers
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-white/60">
                  Your latest research activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentChats.length > 0 && (
                    <div className="space-y-2">
                      {recentChats.map((chat) => (
                        <div key={chat.id} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-400" />
                            <p className="text-sm text-white">
                              Chat session: {chat.session_name || "Untitled"}
                            </p>
                          </div>
                          <p className="text-xs text-white/60 mt-1">
                            {new Date(chat.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {canvases.length > 0 && (
                    <div className="space-y-2">
                      {canvases.map((canvas) => (
                        <div key={canvas.id} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                          <div className="flex items-center gap-2">
                            <Network className="h-4 w-4 text-purple-400" />
                            <p className="text-sm text-white">
                              Canvas: {canvas.name}
                            </p>
                          </div>
                          <p className="text-xs text-white/60 mt-1">
                            {new Date(canvas.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {recentChats.length === 0 && canvases.length === 0 && (
                    <div className="text-center py-6">
                      <Clock className="h-8 w-8 text-white/40 mx-auto mb-2" />
                      <p className="text-white/60 text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
} 