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
import supabase from "~/lib/supabase.client";

export const meta: MetaFunction = () => {
  return [
    { title: "Knowledge Canvas - DelphiX" },
    { name: "description", content: "Manage your research knowledge bases and visualizations" },
  ];
};

// Mock knowledge bases for demo
const mockKnowledgeBases = [
  {
    id: "1",
    name: "Transformer Architecture Research",
    description: "Comprehensive study of transformer models and their applications",
    paper_count: 24,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
    tags: ["Transformers", "NLP", "Attention Mechanism"],
    status: "active"
  },
  {
    id: "2", 
    name: "Computer Vision Fundamentals",
    description: "Core papers and concepts in computer vision and image processing",
    paper_count: 18,
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-01-18T16:20:00Z",
    tags: ["Computer Vision", "CNNs", "Image Processing"],
    status: "active"
  },
  {
    id: "3",
    name: "Reinforcement Learning Survey",
    description: "Survey of modern reinforcement learning techniques and applications",
    paper_count: 31,
    created_at: "2024-01-05T11:00:00Z",
    updated_at: "2024-01-22T13:30:00Z",
    tags: ["RL", "Policy Learning", "Q-Learning"],
    status: "draft"
  }
];

export default function KnowledgeCanvas() {
  const { user } = useAuth();
  const [knowledgeBases, setKnowledgeBases] = useState<typeof mockKnowledgeBases>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredKnowledgeBases, setFilteredKnowledgeBases] = useState<typeof mockKnowledgeBases>([]);

  useEffect(() => {
    if (user) {
      loadKnowledgeBases();
    }
  }, [user]);

  useEffect(() => {
    // Filter knowledge bases based on search query
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
      
      // Try to get knowledge bases from database
      try {
        const { data: kbData } = await supabase
          .from('knowledge_bases')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (kbData && kbData.length > 0) {
          setKnowledgeBases(kbData);
        } else {
          // Use mock data if no knowledge bases exist
          setKnowledgeBases(mockKnowledgeBases);
        }
      } catch (error) {
        console.log('Knowledge bases table not available, using mock data:', error);
        setKnowledgeBases(mockKnowledgeBases);
      }
    } catch (error) {
      console.error('Error loading knowledge bases:', error);
      setKnowledgeBases(mockKnowledgeBases);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    // TODO: Implement create new knowledge base
    console.log("Creating new knowledge base");
  };

  const handleEdit = (id: string) => {
    // TODO: Implement edit knowledge base
    console.log("Editing knowledge base:", id);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete knowledge base
    console.log("Deleting knowledge base:", id);
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
                          <Button
                            size="sm"
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
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
                            onClick={() => handleDelete(kb.id)}
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