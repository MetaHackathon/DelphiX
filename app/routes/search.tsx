import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { 
  Search, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Users, 
  Calendar,
  Filter,
  Grid3X3,
  List,
  Plus,
  BookOpen,
  ExternalLink,
  Download,
  Database,
  Package,
  CheckSquare,
  Square,
  Trash2,
  FolderPlus,
  Settings,
  Tag,
  BarChart3,
  Star,
  TrendingUp,
  Shield,
  Award,
  Target,
  Zap,
  Clock,
  Eye,
  Activity,
  Layers,
  Archive,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";
import { AuthGuard } from "~/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { apiClient } from "~/lib/api";

export const meta: MetaFunction = () => {
  return [
    { title: "Knowledgebase Builder - DelphiX" },
    { name: "description", content: "Build curated research knowledgebases with AI-powered search and selection" },
  ];
};

interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  citations: number;
  url: string;
  topics: string[];
  institution?: string;
  qualityScore?: number;
  relevanceScore?: number;
}

// Mock data for demonstration with quality scores
const MOCK_PAPERS: Paper[] = [
  {
    id: "1",
    title: "Attention Is All You Need",
    abstract: "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. On two machine translation tasks, these models achieve superior quality while being more parallelizable and requiring significantly less time to train.",
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones", "Aidan N. Gomez", "Łukasz Kaiser", "Illia Polosukhin"],
    year: 2017,
    citations: 100000,
    url: "https://arxiv.org/abs/1706.03762",
    topics: ["Transformer", "Attention", "Neural Networks", "NLP"],
    institution: "Google",
    qualityScore: 95,
    relevanceScore: 98
  },
  {
    id: "2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    abstract: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
    authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee", "Kristina Toutanova"],
    year: 2018,
    citations: 80000,
    url: "https://arxiv.org/abs/1810.04805",
    topics: ["BERT", "Transformer", "NLP", "Pre-training"],
    institution: "Google",
    qualityScore: 92,
    relevanceScore: 94
  },
  {
    id: "3",
    title: "Deep Residual Learning for Image Recognition",
    abstract: "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth.",
    authors: ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"],
    year: 2015,
    citations: 120000,
    url: "https://arxiv.org/abs/1512.03385",
    topics: ["ResNet", "Deep Learning", "Computer Vision", "Neural Networks"],
    institution: "Microsoft Research",
    qualityScore: 97,
    relevanceScore: 89
  }
];

function SearchPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Paper[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [knowledgebaseName, setKnowledgebaseName] = useState("");
  const [knowledgebaseDescription, setKnowledgebaseDescription] = useState("");
  const [showKnowledgebasePanel, setShowKnowledgebasePanel] = useState(true);
  const [qualityFilter, setQualityFilter] = useState(0);
  const [showOnlyHighQuality, setShowOnlyHighQuality] = useState(false);

  // Auto-search if there's a query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchQuery(query);
      setHasSearched(true);
      // Trigger search after setting the query
      setTimeout(() => {
        handleSearch(query);
      }, 100);
    }
  }, []);

  const togglePaperSelection = (paperId: string) => {
    const newSelected = new Set(selectedPapers);
    if (newSelected.has(paperId)) {
      newSelected.delete(paperId);
    } else {
      newSelected.add(paperId);
    }
    setSelectedPapers(newSelected);
  };

  const selectAllVisible = () => {
    const allIds = new Set([...selectedPapers, ...results.map(p => p.id)]);
    setSelectedPapers(allIds);
  };

  const selectAllPapers = () => {
    const allIds = new Set(results.map(p => p.id));
    setSelectedPapers(allIds);
  };

  const clearSelection = () => {
    setSelectedPapers(new Set());
  };

  const handleSearch = async (query?: string) => {
    const queryToUse = query || searchQuery;
    if (!queryToUse.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      // Use real API to search papers
      const searchResults = await apiClient.searchPapers(queryToUse, 20);
      
      // Transform API results to match our Paper interface
      const transformedResults = searchResults.map((paper: any) => ({
        id: paper.id,
        title: paper.title,
        abstract: paper.abstract || "",
        authors: paper.authors || [],
        year: paper.year,
        citations: paper.citations || 0,
        url: paper.url,
        topics: paper.topics || [],
        institution: paper.institution,
        qualityScore: Math.floor(Math.random() * 30) + 70, // Mock quality score
        relevanceScore: Math.floor(Math.random() * 20) + 80 // Mock relevance score
      }));
      
      setResults(transformedResults);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock data if API fails
      const filteredPapers = MOCK_PAPERS.filter(paper => 
        paper.title.toLowerCase().includes(queryToUse.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(queryToUse.toLowerCase()) ||
        paper.authors.some(author => author.toLowerCase().includes(queryToUse.toLowerCase())) ||
        paper.topics.some(topic => topic.toLowerCase().includes(queryToUse.toLowerCase()))
      );
      setResults(filteredPapers);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const createKnowledgebase = async () => {
    if (selectedPapers.size === 0 || !knowledgebaseName.trim()) return;
    
    try {
      // Call API to create knowledgebase
      const knowledgebaseData = {
        name: knowledgebaseName,
        description: knowledgebaseDescription,
        papers: Array.from(selectedPapers),
        tags: topTopics, // Use the derived top topics as tags
        is_public: false
      };
      
      await apiClient.createKnowledgebase(knowledgebaseData);
      
      // Show success message
      alert(`Knowledgebase "${knowledgebaseName}" created with ${selectedPapers.size} papers!`);
      
      // Reset after creation
      setSelectedPapers(new Set());
      setKnowledgebaseName("");
      setKnowledgebaseDescription("");
    } catch (error) {
      console.error('Error creating knowledgebase:', error);
      alert('Failed to create knowledgebase. Please try again.');
    }
  };

  const getQualityBadge = (score: number) => {
    if (score >= 90) return { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "High Quality", icon: Award };
    if (score >= 75) return { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Good Quality", icon: Shield };
    return { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", label: "Standard", icon: Target };
  };

  const getKnowledgebaseComposition = () => {
    const selectedPaperData = results.filter(p => selectedPapers.has(p.id));
    const avgQuality = selectedPaperData.length > 0 
      ? selectedPaperData.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / selectedPaperData.length 
      : 0;
    const topicsMap = new Map();
    selectedPaperData.forEach(paper => {
      paper.topics.forEach(topic => {
        topicsMap.set(topic, (topicsMap.get(topic) || 0) + 1);
      });
    });
    const topTopics = Array.from(topicsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    return { avgQuality, topTopics, yearRange: selectedPaperData.length > 0 ? {
      min: Math.min(...selectedPaperData.map(p => p.year)),
      max: Math.max(...selectedPaperData.map(p => p.year))
    } : null };
  };

  const suggestions = ["transformer architecture", "attention mechanism", "BERT", "neural networks", "computer vision"];
  const { avgQuality, topTopics, yearRange } = getKnowledgebaseComposition();

  return (
    <div className="min-h-screen bg-[#030303] pt-16">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-lg">
              <Brain className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Research Knowledgebase Builder</h1>
              <p className="text-white/60 text-sm">Curate high-quality research knowledgebases with AI-powered quality assessment</p>
            </div>
          </div>

          {/* Compact Workflow Steps */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { step: 1, title: "Search & Discover", icon: Search, active: true },
              { step: 2, title: "Quality Assessment", icon: Shield, active: hasSearched },
              { step: 3, title: "Curate Selection", icon: CheckSquare, active: selectedPapers.size > 0 },
              { step: 4, title: "Build Knowledgebase", icon: Brain, active: selectedPapers.size > 0 && knowledgebaseName.trim() }
            ].map(({ step, title, icon: Icon, active }) => (
              <div key={step} className={cn(
                "flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 text-xs",
                active 
                  ? "bg-indigo-500/10 border-indigo-500/30 text-white" 
                  : "bg-white/[0.02] border-white/[0.05] text-white/40"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  active ? "bg-indigo-500 text-white" : "bg-white/[0.05] text-white/40"
                )}>
                  {step}
                </div>
                <div className="min-w-0">
                  <Icon className="h-3 w-3 mb-1" />
                  <p className="font-medium truncate">{title}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Compact Search Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-white/[0.02] border-white/[0.08]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search research papers for your knowledgebase..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-10 pl-10 pr-4 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <Button
                  onClick={() => handleSearch()}
                  disabled={isLoading || !searchQuery.trim()}
                  className="h-10 px-6 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="highQuality"
                      checked={showOnlyHighQuality}
                      onChange={(e) => setShowOnlyHighQuality(e.target.checked)}
                      className="rounded border-white/20 bg-white/5"
                    />
                    <label htmlFor="highQuality" className="text-white/60">High Quality Only (90+)</label>
                  </div>
                  
                  {results.length > 0 && (
                    <Button
                      onClick={selectAllPapers}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-indigo-400 hover:text-indigo-300"
                    >
                      <CheckSquare className="h-3 w-3 mr-1" />
                      Select All ({results.length})
                    </Button>
                  )}
                </div>
                
                {!hasSearched && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/40">Try:</span>
                    {suggestions.slice(0, 3).map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-2 py-1 bg-white/[0.05] text-white/60 rounded text-xs hover:bg-white/[0.08] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Compact Knowledgebase Builder Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-1 space-y-4"
          >
            {/* Knowledgebase Configuration */}
            <Card className="bg-white/[0.02] border-white/[0.08] sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <Brain className="h-4 w-4 text-indigo-400" />
                  Knowledgebase Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Knowledgebase Name</label>
                  <Input
                    placeholder="e.g., Transformer Architecture Papers"
                    value={knowledgebaseName}
                    onChange={(e) => setKnowledgebaseName(e.target.value)}
                    className="bg-white/[0.05] border-white/[0.1] text-white h-8 text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Description</label>
                  <textarea
                    placeholder="Describe the purpose and scope..."
                    value={knowledgebaseDescription}
                    onChange={(e) => setKnowledgebaseDescription(e.target.value)}
                    className="w-full h-16 px-2 py-1 bg-white/[0.05] border border-white/[0.1] rounded text-white placeholder:text-white/40 text-xs resize-none focus:outline-none focus:border-white/[0.2]"
                  />
                </div>

                <Button
                  onClick={createKnowledgebase}
                  disabled={selectedPapers.size === 0 || !knowledgebaseName.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-8 text-sm"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Build Knowledgebase ({selectedPapers.size})
                </Button>
              </CardContent>
            </Card>

            {/* Compact Knowledgebase Composition */}
            {selectedPapers.size > 0 && (
              <Card className="bg-white/[0.02] border-white/[0.08]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white text-sm">
                    <BarChart3 className="h-4 w-4 text-indigo-400" />
                    Composition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/[0.02] rounded p-2">
                      <div className="text-white/40 text-xs">Papers</div>
                      <div className="text-white font-bold">{selectedPapers.size}</div>
                    </div>
                    <div className="bg-white/[0.02] rounded p-2">
                      <div className="text-white/40 text-xs">Avg Quality</div>
                      <div className="text-white font-bold">{avgQuality.toFixed(0)}</div>
                    </div>
                  </div>

                  {yearRange && (
                    <div className="bg-white/[0.02] rounded p-2">
                      <div className="text-white/40 text-xs mb-1">Year Range</div>
                      <div className="text-white text-xs">{yearRange.min} - {yearRange.max}</div>
                    </div>
                  )}

                  {topTopics.length > 0 && (
                    <div>
                      <div className="text-white/40 text-xs mb-2">Top Topics</div>
                      <div className="flex flex-wrap gap-1">
                        {topTopics.map(topic => (
                          <Badge key={topic} variant="secondary" className="bg-indigo-500/20 text-indigo-300 text-xs py-0">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="text-white/60 hover:text-white h-6 px-2 text-xs"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Compact Search Results */}
          <div className="lg:col-span-3">
            {hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Results Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">
                      {isLoading ? "Analyzing Papers..." : `${results.length} candidates found`}
                    </h2>
                    {selectedPapers.size > 0 && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        {selectedPapers.size} selected for knowledgebase
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Activity className="h-3 w-3 mr-1" />
                      Quality Filter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                    >
                      {viewMode === 'list' ? <Grid3X3 className="h-3 w-3" /> : <List className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                {/* Paper Candidates - Compact */}
                <div className="h-[500px] overflow-y-auto space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mx-auto mb-3" />
                        <p className="text-white/80 text-sm">Analyzing paper quality and relevance...</p>
                      </div>
                    </div>
                  ) : results.length > 0 ? (
                    results.map((paper, index) => {
                      const qualityBadge = getQualityBadge(paper.qualityScore || 0);
                      const isSelected = selectedPapers.has(paper.id);
                      
                      return (
                        <motion.div
                          key={paper.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                        >
                          <Card 
                            className={cn(
                              "group cursor-pointer transition-all duration-300 relative border-l-4",
                              isSelected 
                                ? "bg-green-500/5 border-white/[0.15] border-l-green-500 shadow-lg shadow-green-500/10"
                                : "bg-white/[0.02] border-white/[0.05] border-l-white/10 hover:border-white/[0.15] hover:border-l-indigo-500"
                            )}
                            onClick={() => togglePaperSelection(paper.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                {/* Selection Checkbox */}
                                <div className="flex-shrink-0 pt-1">
                                  {isSelected ? (
                                    <CheckSquare className="h-4 w-4 text-green-400" />
                                  ) : (
                                    <Square className="h-4 w-4 text-white/30 group-hover:text-white/50 transition-colors" />
                                  )}
                                </div>

                                {/* Paper Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 pr-3">
                                      {paper.title}
                                    </h3>
                                    
                                    {/* Quality Indicators */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <Badge className={cn(qualityBadge.color, "text-xs")}>
                                        <qualityBadge.icon className="h-2 w-2 mr-1" />
                                        {paper.qualityScore}
                                      </Badge>
                                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                                        <TrendingUp className="h-2 w-2 mr-1" />
                                        {paper.relevanceScore}%
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <p className="text-white/70 mb-3 line-clamp-2 leading-relaxed text-sm">
                                    {paper.abstract}
                                  </p>
                                  
                                  {/* Metadata Row */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-white/60">
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>{paper.authors.slice(0, 2).join(", ")}{paper.authors.length > 2 ? ` +${paper.authors.length - 2}` : ""}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{paper.year}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        <span>{paper.citations.toLocaleString()}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {/* Topics */}
                                      <div className="flex gap-1">
                                        {paper.topics.slice(0, 2).map((topic) => (
                                          <Badge key={topic} variant="secondary" className="bg-indigo-500/10 text-indigo-300 text-xs py-0">
                                            {topic}
                                          </Badge>
                                        ))}
                                      </div>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(paper.url, '_blank');
                                        }}
                                        className="text-indigo-400 hover:text-indigo-300 h-6 w-6 p-0"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center max-w-md">
                        <Search className="h-10 w-10 text-white/20 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold mb-2 text-white">No research papers found</h3>
                        <p className="text-white/60 mb-4 text-sm">
                          Try different keywords or adjust your quality filters.
                        </p>
                        <Button
                          onClick={() => {
                            setSearchQuery("");
                            setHasSearched(false);
                            setResults([]);
                          }}
                          variant="outline"
                          className="border-white/[0.1] text-white/80 hover:bg-white/[0.08] text-sm"
                        >
                          New Search
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <AuthGuard>
      <SearchPageContent />
    </AuthGuard>
  );
} 