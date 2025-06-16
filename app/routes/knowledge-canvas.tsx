import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { motion } from 'framer-motion';
import { Search, Eye, Network, FileText, Users, Calendar, MoreVertical, Edit, Trash2, Upload, Brain, Database, Filter, Grid3X3, List, Star, Clock, TrendingUp, BarChart3, Package, Settings, Plus, ArrowRight, Zap, Activity } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { cn } from '~/lib/utils';
import { AuthGuard, useAuth } from "~/components/auth-guard";
import { apiClient } from "~/lib/api";

export const meta: MetaFunction = () => {
  return [
    { title: "Knowledge Canvas - DelphiX" },
    { name: "description", content: "Manage your research knowledge bases and visualizations" },
  ];
};

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  paper_count: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  status: string;
  user_id: string;
  is_public: boolean;
}

// Elegant minimalistic loader component
function ElegantLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="relative w-8 h-8 mx-auto mb-4">
          <div className="absolute inset-0 border border-white/10 rounded-full"></div>
          <motion.div 
            className="absolute inset-0 border border-t-white/60 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-white/50 text-sm font-medium">{text}</p>
      </div>
    </div>
  );
}

function KnowledgeCanvasContent() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name' | 'papers'>('updated');
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('knowledge-canvas-data');
      return cached ? JSON.parse(cached) : [];
    }
    return [];
  });
  const [filteredKnowledgeBases, setFilteredKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(() => {
    // Only show loading if we have no cached data
    if (typeof window !== 'undefined') {
      const hasData = localStorage.getItem('knowledge-canvas-data');
      return !hasData;
    }
    return true;
  });
  const [error, setError] = useState<string | null>(null);

  // Filter and sort knowledge bases
  useEffect(() => {
    let filtered = knowledgeBases;
    
    if (searchQuery.trim()) {
      filtered = knowledgeBases.filter(kb => 
        kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kb.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'papers':
          return b.paper_count - a.paper_count;
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    setFilteredKnowledgeBases(filtered);
  }, [searchQuery, knowledgeBases, sortBy]);

  const loadKnowledgeBases = async () => {
    if (!user) {
      console.log('No user found, skipping knowledge base load');
      return;
    }

    try {
      setError(null);
      
      // Set user ID for API client BEFORE making requests
      console.log('Loading knowledge bases for user:', user.id);
      apiClient.setUserId(user.id);
      
      console.log('Making API call to /api/knowledgebases...');
      
      const response = await apiClient.getKnowledgebases();
      console.log('API response received:', {
        type: typeof response,
        isArray: Array.isArray(response),
        length: Array.isArray(response) ? response.length : 'not array'
      });
      
      if (Array.isArray(response)) {
        console.log(`Successfully loaded ${response.length} knowledge bases`);
        setKnowledgeBases(response);
        
        // Cache the successful response
        localStorage.setItem('knowledge-canvas-data', JSON.stringify(response));
        localStorage.setItem('knowledge-canvas-last-fetch', Date.now().toString());
      } else {
        console.log('Invalid response format - expected array, got:', typeof response);
        setKnowledgeBases([]);
      }
    } catch (error) {
      console.error('Error loading knowledge bases:', error);
      setError('Failed to load knowledge bases. Please try again later.');
      setKnowledgeBases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('User detected:', user.id);

      
      // Check if data is fresh (less than 10 minutes old)
      const lastFetch = localStorage.getItem('knowledge-canvas-last-fetch');
      const cachedData = localStorage.getItem('knowledge-canvas-data');
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;
      
      console.log('Cache status:', {
        lastFetch,
        cachedData: cachedData ? JSON.parse(cachedData).length + ' items' : 'no data',
        timeSinceLastFetch: lastFetch ? (now - parseInt(lastFetch)) / 1000 + 's ago' : 'never'
      });
      
      // Load cached data first if available and fresh
      if (cachedData && lastFetch && (now - parseInt(lastFetch)) < tenMinutes) {
        console.log('Using cached data');
        const parsedData = JSON.parse(cachedData);
        setKnowledgeBases(parsedData);
        setLoading(false);
      } else {
        console.log('Loading fresh data from API');
        loadKnowledgeBases();
      }
    }
  }, [user]);

  const handleUploadKnowledgebase = () => {
    window.location.href = '/papers/upload';
  };

  const handleGenerateKnowledgebase = () => {
    window.location.href = '/search';
  };

  const handleEdit = (id: string) => {
    window.location.href = `/knowledge-base/${id}`;
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteKnowledgebase(id);
      const updatedKnowledgeBases = knowledgeBases.filter(kb => kb.id !== id);
      setKnowledgeBases(updatedKnowledgeBases);
      localStorage.setItem('knowledge-canvas-data', JSON.stringify(updatedKnowledgeBases));
      alert('Knowledge base deleted successfully');
    } catch (error) {
      console.error('Error deleting knowledge base:', error);
      alert('Failed to delete knowledge base');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return formatDate(dateString);
  };

  const getStats = () => {
    const totalPapers = knowledgeBases.reduce((sum, kb) => sum + kb.paper_count, 0);
    const activeBases = knowledgeBases.filter(kb => kb.status === 'active').length;
    const recentlyUpdated = knowledgeBases.filter(kb => {
      const daysSinceUpdate = Math.floor((Date.now() - new Date(kb.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceUpdate <= 7;
    }).length;

    return { totalPapers, activeBases, recentlyUpdated };
  };

  const stats = getStats();

  // Early return for loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] pt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Knowledge Canvas</h1>
            <p className="text-white/60">Manage your research project document bases</p>
          </div>
          <ElegantLoader text="Loading knowledge bases..." />
        </div>
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#030303] pt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Knowledge Canvas</h1>
            <p className="text-white/60">Manage your research project document bases</p>
          </div>
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                <p className="text-red-400">{error}</p>
              </div>
              <Button onClick={loadKnowledgeBases} variant="outline" className="text-white border-white/[0.1]">
                Try Again
              </Button>
            </div>
          </div>
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
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Knowledge Canvas</h1>
              <p className="text-white/60">Manage your research project document bases</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Database className="h-4 w-4" />
                <span>{knowledgeBases.length} bases</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <FileText className="h-4 w-4" />
                <span>{stats.totalPapers} papers</span>
              </div>
              <Button
                onClick={() => {
                  console.log('Force refresh clicked - clearing cache');
                  localStorage.removeItem('knowledge-canvas-data');
                  localStorage.removeItem('knowledge-canvas-last-fetch');
                  loadKnowledgeBases();
                }}
                variant="outline"
                size="sm"
                className="text-white border-white/[0.1] hover:bg-white/[0.05]"
              >
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Database className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Total Bases</p>
                    <p className="text-lg font-semibold text-white">{knowledgeBases.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Activity className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Active</p>
                    <p className="text-lg font-semibold text-white">{stats.activeBases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <FileText className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Total Papers</p>
                    <p className="text-lg font-semibold text-white">{stats.totalPapers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/[0.08]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Updated (7d)</p>
                    <p className="text-lg font-semibold text-white">{stats.recentlyUpdated}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
              <Input
                placeholder="Search knowledge bases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-white/40 focus:bg-white/[0.1] focus:border-white/[0.25] rounded-xl transition-all duration-200 shadow-lg backdrop-blur-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white/[0.06] border border-white/[0.12] text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:bg-white/[0.1] focus:border-white/[0.25] transition-all duration-200 shadow-lg backdrop-blur-sm cursor-pointer hover:bg-white/[0.08]"
                >
                  <option value="updated" className="bg-gray-900 text-white">Sort by Updated</option>
                  <option value="created" className="bg-gray-900 text-white">Sort by Created</option>
                  <option value="name" className="bg-gray-900 text-white">Sort by Name</option>
                  <option value="papers" className="bg-gray-900 text-white">Sort by Papers</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/[0.06] border border-white/[0.12] rounded-xl p-1 shadow-lg backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "px-3 py-2 rounded-lg transition-all duration-200",
                    viewMode === 'grid' 
                      ? "bg-white/[0.15] text-white shadow-md" 
                      : "text-white/60 hover:text-white hover:bg-white/[0.08]"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-2 rounded-lg transition-all duration-200",
                    viewMode === 'list' 
                      ? "bg-white/[0.15] text-white shadow-md" 
                      : "text-white/60 hover:text-white hover:bg-white/[0.08]"
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {filteredKnowledgeBases.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredKnowledgeBases.map((kb, index) => (
                  <motion.div
                    key={kb.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/knowledge-base/${kb.id}`} className="block group h-80">
                      <Card className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.12] hover:border-white/[0.2] transition-all duration-300 hover:scale-[1.02] group-hover:shadow-2xl h-full backdrop-blur-xl overflow-hidden flex flex-col">
                        {/* Document Preview Area - Fixed Height */}
                        <div className="relative h-32 bg-gradient-to-br from-white/[0.05] to-white/[0.02] border-b border-white/[0.08] overflow-hidden flex-shrink-0">
                          {/* Simulated document stack */}
                          <div className="absolute inset-0 p-3">
                            <div className="relative h-full">
                              {/* Background documents */}
                              <div className="absolute top-1 left-2 right-1 h-full bg-white/[0.03] rounded border border-white/[0.06] transform rotate-1"></div>
                              <div className="absolute top-0.5 left-1 right-1.5 h-full bg-white/[0.04] rounded border border-white/[0.07] transform -rotate-0.5"></div>
                              
                              {/* Main document preview */}
                              <div className="relative h-full bg-white/[0.06] rounded border border-white/[0.1] p-2.5 overflow-hidden">
                                {/* Simulated text content based on tags */}
                                <div className="space-y-1.5">
                                  <div className="h-1.5 bg-white/[0.15] rounded w-3/4"></div>
                                  <div className="h-1 bg-white/[0.08] rounded w-full"></div>
                                  <div className="h-1 bg-white/[0.08] rounded w-5/6"></div>
                                  <div className="h-1 bg-white/[0.08] rounded w-2/3"></div>
                                  <div className="mt-2 flex gap-1">
                                    {kb.tags.slice(0, 2).map((tag, i) => (
                                      <div key={i} className="h-1 bg-white/[0.12] rounded w-8"></div>
                                    ))}
                                  </div>
                                  <div className="h-1 bg-white/[0.06] rounded w-4/5"></div>
                                  <div className="h-1 bg-white/[0.06] rounded w-3/5"></div>
                                </div>
                                
                                {/* Paper count overlay */}
                                <div className="absolute bottom-1.5 right-1.5 bg-white/[0.15] backdrop-blur-sm rounded px-1.5 py-0.5 border border-white/[0.1]">
                                  <span className="text-xs font-medium text-white/80">{kb.paper_count}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Status indicator */}
                          <div className="absolute top-2 right-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full border border-white/20",
                              kb.status === 'active' 
                                ? "bg-white/30" 
                                : "bg-white/10"
                            )}></div>
                          </div>
                        </div>

                        {/* Content Area - Flexible Height */}
                        <CardContent className="p-4 flex-1 flex flex-col">
                          {/* Header - Fixed Height */}
                          <div className="mb-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-white leading-tight group-hover:text-white/95 line-clamp-2 min-h-[2.5rem]">
                                  {kb.name}
                                </h3>
                              </div>
                              <div className="text-xs text-white/30 font-mono ml-2 flex-shrink-0">
                                {getTimeAgo(kb.updated_at)}
                              </div>
                            </div>
                            <p className="text-white/50 text-xs leading-relaxed line-clamp-2 font-light min-h-[2rem]">
                              {kb.description}
                            </p>
                          </div>

                          {/* Quick stats - Fixed Height */}
                          <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{kb.paper_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(kb.updated_at).getFullYear()}</span>
                            </div>
                            <Badge 
                              className={cn(
                                "text-xs px-1.5 py-0.5",
                                kb.status === 'active' 
                                  ? "bg-white/[0.1] text-white/60 border-0" 
                                  : "bg-white/[0.05] text-white/40 border-0"
                              )}
                            >
                              {kb.status}
                            </Badge>
                          </div>

                          {/* Tags - Fixed Height at bottom */}
                          <div className="mt-auto">
                            <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
                              {kb.tags.slice(0, 3).map((tag) => (
                                <span 
                                  key={tag}
                                  className="text-xs text-white/50 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.08] truncate max-w-[80px]"
                                  title={tag}
                                >
                                  {tag.length > 10 ? `${tag.substring(0, 10)}...` : tag}
                                </span>
                              ))}
                              {kb.tags.length > 3 && (
                                <span className="text-xs text-white/40 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06]">
                                  +{kb.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredKnowledgeBases.map((kb, index) => (
                  <motion.div
                    key={kb.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link to={`/knowledge-base/${kb.id}`} className="block group">
                      <Card className="bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/[0.1] hover:border-white/[0.16] transition-all duration-200 group-hover:scale-[1.01] backdrop-blur-xl overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex">
                            {/* Mini Document Preview */}
                            <div className="relative w-24 h-16 bg-gradient-to-br from-white/[0.08] to-white/[0.03] border-r border-white/[0.08] flex-shrink-0">
                              <div className="absolute inset-1">
                                <div className="relative h-full bg-white/[0.06] rounded border border-white/[0.08] p-1 overflow-hidden">
                                  {/* Mini document content */}
                                  <div className="space-y-0.5">
                                    <div className="h-0.5 bg-white/[0.12] rounded w-3/4"></div>
                                    <div className="h-0.5 bg-white/[0.06] rounded w-full"></div>
                                    <div className="h-0.5 bg-white/[0.06] rounded w-2/3"></div>
                                    <div className="mt-1 flex gap-0.5">
                                      {kb.tags.slice(0, 2).map((tag, i) => (
                                        <div key={i} className="h-0.5 bg-white/[0.1] rounded w-3"></div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Paper count */}
                                  <div className="absolute bottom-0.5 right-0.5 bg-white/[0.15] rounded px-1 py-0.5">
                                    <span className="text-xs font-medium text-white/70">{kb.paper_count}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Status dot */}
                              <div className="absolute top-1 right-1">
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  kb.status === 'active' 
                                    ? "bg-white/40" 
                                    : "bg-white/20"
                                )}></div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-white font-semibold truncate text-base group-hover:text-white/95">{kb.name}</h3>
                                    <Badge 
                                      className={cn(
                                        "text-xs px-1.5 py-0.5",
                                        kb.status === 'active' 
                                          ? "bg-white/[0.1] text-white/60 border-0" 
                                          : "bg-white/[0.05] text-white/40 border-0"
                                      )}
                                    >
                                      {kb.status}
                                    </Badge>
                                  </div>
                                  <p className="text-white/50 text-sm truncate mb-2 font-light">{kb.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-white/40">
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-3 w-3" />
                                      <span>{kb.paper_count} papers</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>Updated {getTimeAgo(kb.updated_at)}</span>
                                    </div>
                                    <div className="flex gap-1">
                                      {kb.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="text-xs text-white/40 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.06] truncate max-w-[60px]" title={tag}>
                                          {tag.length > 8 ? `${tag.substring(0, 8)}...` : tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-white/30 font-mono ml-4 flex-shrink-0">
                                  {getTimeAgo(kb.updated_at)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-32"
          >
            <div className="max-w-lg mx-auto">
              <div className="relative mb-8">
                <div className="p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.03] rounded-2xl border border-white/[0.12] backdrop-blur-xl mx-auto w-24 h-24 flex items-center justify-center shadow-2xl">
                  <Database className="h-10 w-10 text-white/60" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-white/20 to-white/10 rounded-full border border-white/20" />
              </div>
              
              <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">
                {searchQuery ? "No knowledge bases found" : "Create Your First Knowledge Base"}
              </h2>
              <p className="text-white/60 mb-12 leading-relaxed font-light text-lg">
                {searchQuery 
                  ? "Try adjusting your search terms or create a new knowledge base to get started." 
                  : "Start organizing your research by creating curated knowledge bases for your projects and research areas."
                }
              </p>
              
              {!searchQuery && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleUploadKnowledgebase}
                    className="bg-white/[0.12] hover:bg-white/[0.18] text-white border border-white/[0.15] hover:border-white/[0.25] backdrop-blur-sm transition-all duration-300 font-medium px-8 py-3 shadow-xl"
                  >
                    <Upload className="h-4 w-4 mr-3" />
                    Upload Documents
                  </Button>
                  <Button
                    onClick={handleGenerateKnowledgebase}
                    variant="outline"
                    className="bg-white/[0.05] border-white/[0.15] text-white/80 hover:bg-white/[0.12] hover:text-white hover:border-white/[0.25] backdrop-blur-sm transition-all duration-300 font-medium px-8 py-3"
                  >
                    <Brain className="h-4 w-4 mr-3" />
                    Generate from Search
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function KnowledgeCanvas() {
  return (
    <AuthGuard>
      <KnowledgeCanvasContent />
    </AuthGuard>
  );
} 