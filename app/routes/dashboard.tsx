import type { MetaFunction } from "@remix-run/node";
import { useNavigate, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "~/components/auth-guard";
import { apiClient } from "~/lib/api";
import supabase from "~/lib/supabase.client";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  Search, 
  Plus, 
  FileText, 
  Network, 
  Brain,
  BookOpen,
  Users,
  Star,
  Calendar,
  Clock,
  Sparkles,
  Loader2,
  ArrowRight,
  BarChart3,
  MessageCircle,
  Volume2
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - DelphiX" },
    { name: "description", content: "Your research dashboard with AI-powered insights" },
  ];
};

function DashboardContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [stats, setStats] = useState<any>({});
  const [recentPapers, setRecentPapers] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      // Fetch dashboard data from backend
      const dashboardData: any = await apiClient.getDashboard();
      setStats(dashboardData.quick_stats || {});
      // Optionally, set research_metrics from ai_insights or other fields
      if (dashboardData.ai_insights && dashboardData.ai_insights.length > 0) {
        setStats((prev: any) => ({
          ...prev,
          research_metrics: {
            // Example: use the first insight for summary, or aggregate as needed
            quality_score: 8,
            quality_summary: dashboardData.ai_insights[0]?.insights?.[0] || "Initial research quality analysis",
            trending_topics: [],
            papers_this_week: 0,
            active_hours: 0,
            engagement_score: 0
          }
        }));
      }
      // Get recent papers
      try {
        const papersData = await apiClient.getLibrary() as any[];
        setRecentPapers(papersData.slice(0, 5));
      } catch (error) {
        setRecentPapers([]);
      }
      // Get recent chat sessions
      try {
        const { data: chatsData } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(3);
        setRecentChats(chatsData || []);
      } catch (error) {
        setRecentChats([]);
      }
      // Get knowledge bases
      try {
        const { data: kbData } = await supabase
          .from('knowledge_bases')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        setKnowledgeBases(kbData || []);
      } catch (error) {
        setKnowledgeBases([]);
      }
    } catch (error) {
      setError('Failed to load dashboard data. Please try again later.');
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
      description: "Browse and open your PDFs",
      icon: FileText,
      href: "/document",
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
      title: "Generate Podcast",
      description: "Create audio versions of your papers",
      icon: Volume2,
      href: "/podcast",
      color: "from-orange-500 to-red-500",
    },
  ];

  // Early return for loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your research dashboard...</p>
        </div>
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#030303] pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/10 rounded-lg p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
          <Button onClick={loadUserData} variant="outline" className="text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
          transition={{ duration: 0.6, delay: 0.2 }}
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
                  <Volume2 className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Podcasts</p>
                  <p className="text-xl font-semibold text-white">
                    {stats.total_podcasts || 0}
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
                  <p className="text-sm text-white/60">Knowledge Bases</p>
                  <p className="text-xl font-semibold text-white">
                    {stats.total_knowledgebases || 0}
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
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <Card className="bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] transition-all duration-200 hover:scale-[1.02] cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-medium text-white mb-1">{action.title}</h3>
                    <p className="text-sm text-white/60">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Papers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Papers
                </CardTitle>
                <CardDescription className="text-white/60">
                  Your most recent PDF uploads
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentPapers.length > 0 ? (
                  <div className="space-y-3">
                    {recentPapers.map((paper) => (
                      <Link key={paper.id} to={`/document/${paper._originalData?.arxiv_id || paper.id}`} state={{ paper }} prefetch="intent">
                        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                          <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
                            {paper.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-white/60">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{paper.authors?.slice(0, 2).join(", ")}{paper.authors?.length > 2 ? ` +${paper.authors.length - 2}` : ""}</span>
                              </div>
                              {paper.year && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{paper.year}</span>
                                </div>
                              )}
                              {paper.citations && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  <span>{paper.citations.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
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
                        <ArrowRight className="h-4 w-4 ml-2" />
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

          {/* Research Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Research Insights
                </CardTitle>
                <CardDescription className="text-white/60">
                  AI-powered analysis of your research
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.research_metrics ? (
                  <div className="space-y-4">
                    {/* Research Quality */}
                    <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">Research Quality</h4>
                        <Badge variant="outline" className="text-xs border-white/[0.1] text-white/60">
                          {stats.research_metrics.quality_score}/10
                        </Badge>
                      </div>
                      <p className="text-xs text-white/60">{stats.research_metrics.quality_summary}</p>
                    </div>

                    {/* Trending Topics */}
                    <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                      <h4 className="text-sm font-medium text-white mb-2">Trending Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {stats.research_metrics.trending_topics?.map((topic: string) => (
                          <Badge key={topic} variant="outline" className="text-xs border-white/[0.1] text-white/60">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Research Activity */}
                    <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                      <h4 className="text-sm font-medium text-white mb-2">Activity Overview</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/60">Papers this week</span>
                          <span className="text-white">{stats.research_metrics.papers_this_week}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/60">Active hours</span>
                          <span className="text-white">{stats.research_metrics.active_hours}h</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/60">Engagement score</span>
                          <span className="text-white">{stats.research_metrics.engagement_score}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BarChart3 className="h-8 w-8 text-white/40 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">No insights available yet</p>
                    <p className="text-xs text-white/40 mt-1">Add more papers to generate insights</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
} 