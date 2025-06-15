import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Plus, Eye, MessageCircle, Network, Download, Settings, Sparkles, FileText, Users, Zap, Calendar, MoreVertical, Edit, Trash2 } from "lucide-react";
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

// Remove mock data - we'll load real data from API
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

export default function KnowledgeCanvas() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filter knowledge bases based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredKnowledgeBases(knowledgeBases);
      return;
    }

    const filtered = knowledgeBases.filter(kb => 
      kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredKnowledgeBases(filtered);
  }, [searchQuery, knowledgeBases]);

  const loadKnowledgeBases = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading knowledge bases from API...');
      
      // Load knowledge bases from the API (auth token is automatically set)
      const response = await apiClient.getKnowledgebases();
      console.log('API response:', response);
      
      // The response should be an array of knowledge bases
      if (Array.isArray(response)) {
        setKnowledgeBases(response);
        localStorage.setItem('knowledge-canvas-data', JSON.stringify(response));
        console.log(`Loaded ${response.length} knowledge bases`);
      } else {
        console.log('No knowledge bases found or invalid response');
        setKnowledgeBases([]);
        localStorage.setItem('knowledge-canvas-data', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error loading knowledge bases:', error);
      setError('Failed to load knowledge bases. Please try again later.');
      
      // Show a user-friendly error message if the API is not available
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.warn('DataEngineX backend appears to be unavailable. Please ensure it is running on http://localhost:8000');
        setError('DataEngineX backend is unavailable. Please ensure it is running.');
      }
    } finally {
      setLoading(false);
      // Mark data as fresh
      localStorage.setItem('knowledge-canvas-last-fetch', Date.now().toString());
    }
  };

  // Load knowledge bases when component mounts or user changes
  useEffect(() => {
    if (user) {
      // Check if data is fresh (less than 2 minutes old)
      const lastFetch = localStorage.getItem('knowledge-canvas-last-fetch');
      const now = Date.now();
      const twoMinutes = 2 * 60 * 1000;
      
      if (!lastFetch || (now - parseInt(lastFetch)) > twoMinutes) {
        loadKnowledgeBases();
      }
    }
  }, [user]);

  const handleCreateNew = () => {
    // Navigate to search page to create a new knowledge base
    window.location.href = '/search';
  };

  const handleEdit = (id: string) => {
    // Navigate to knowledge base detail page
    window.location.href = `/knowledge-base/${id}`;
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteKnowledgebase(id);
      // Update state directly instead of reloading
      const updatedKnowledgeBases = knowledgeBases.filter(kb => kb.id !== id);
      setKnowledgeBases(updatedKnowledgeBases);
      // Update localStorage cache
      localStorage.setItem('knowledge-canvas-data', JSON.stringify(updatedKnowledgeBases));
      alert('Knowledge base deleted successfully');
    } catch (error) {
      console.error('Error deleting knowledge base:', error);
      alert('Failed to delete knowledge base');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AuthGuard>
      <>
        <div className="min-h-screen bg-[#030303] pt-20">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Knowledge Canvas
                  </h1>
                  <p className="text-white/60">
                    Manage your research knowledge bases and visualizations
                  </p>
                </div>
                <Button
                  onClick={handleCreateNew}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    placeholder="Search knowledge bases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "pl-10",
                      "bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/40",
                      "focus:bg-white/[0.08] focus:border-white/[0.2]"
                    )}
                  />
                </div>
              </div>
            </motion.div>

            {/* Knowledge Bases Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 text-white/60">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading knowledge bases...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto px-4">
                  <div className="bg-red-500/10 rounded-lg p-4 mb-4">
                    <p className="text-red-400">{error}</p>
                  </div>
                  <Button 
                    onClick={loadKnowledgeBases} 
                    variant="outline" 
                    className="text-white border-white/[0.1] hover:bg-white/[0.05]"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : filteredKnowledgeBases.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredKnowledgeBases.map((kb) => (
                  <Card key={kb.id} className="bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg font-semibold line-clamp-1 mb-1">
                            {kb.name}
                          </CardTitle>
                          <CardDescription className="text-white/60 text-sm line-clamp-2">
                            {kb.description}
                          </CardDescription>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{kb.paper_count} papers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(kb.updated_at)}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {kb.tags.slice(0, 3).map((tag) => (
                            <Badge 
                              key={tag}
                              variant="outline"
                              className="text-xs border-white/[0.1] text-white/60"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {kb.tags.length > 3 && (
                            <Badge 
                              variant="outline"
                              className="text-xs border-white/[0.1] text-white/60"
                            >
                              +{kb.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between">
                          <Badge 
                            className={cn(
                              "text-xs",
                              kb.status === 'active' 
                                ? "bg-green-500/20 text-green-300 border-green-500/30" 
                                : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            )}
                          >
                            {kb.status}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Link to={`/knowledge-base/${kb.id}`} className="flex-1">
                            <Button
                              size="sm"
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/[0.02] border-white/[0.1] text-white hover:bg-white/[0.05]"
                            onClick={() => handleEdit(kb.id)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/[0.02] border-white/[0.1] text-white hover:bg-white/[0.05]"
                            onClick={() => handleDelete(kb.id, kb.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center py-16"
              >
                <Network className="h-16 w-16 text-white/40 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {searchQuery ? "No knowledge bases found" : "Create Your First Knowledge Base"}
                </h2>
                <p className="text-white/60 mb-8 max-w-lg mx-auto">
                  {searchQuery 
                    ? "Try adjusting your search terms or create a new knowledge base." 
                    : "Start building your research knowledge by creating collections of related papers and concepts."
                  }
                </p>
                <Button
                  onClick={handleCreateNew}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Knowledge Base
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </>
    </AuthGuard>
  );
} 