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
import { useNavigate } from "react-router-dom";
import React from "react";

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
  _originalData?: {
    arxiv_id: string;
    title: string;
    abstract: string;
    authors: string[];
    year: number;
    citations: number;
    pdf_url: string;
    topics: string[];
    institution: string;
  };
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
  const [isCreatingKB, setIsCreatingKB] = useState(false);
  const [results, setResults] = useState<Paper[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [knowledgebaseName, setKnowledgebaseName] = useState("");
  const [knowledgebaseDescription, setKnowledgebaseDescription] = useState("");
  const [showKnowledgebasePanel, setShowKnowledgebasePanel] = useState(true);
  const [qualityFilter, setQualityFilter] = useState(0);
  const [showOnlyHighQuality, setShowOnlyHighQuality] = useState(false);
  const [lastSearchInfo, setLastSearchInfo] = useState<{
    strategiesUsed?: string[];
    processingTime?: string;
    totalCandidates?: number;
  } | null>(null);
  const navigate = useNavigate();

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
      // Use intelligent search for better results
      const searchResponse = await apiClient.intelligentSearch(queryToUse, {
        max_papers: 100,
        include_foundational: true,
        include_recent: true,
        time_range_years: 10,
      });
      
      // Transform API results to match our Paper interface
      const transformedResults = (searchResponse as any).papers.map((paper: any) => ({
        id: `temp-${paper.arxiv_id || paper.id || Math.random().toString(36).substr(2, 9)}`, // Use temp UUID
        title: paper.title,
        abstract: paper.summary || paper.abstract || "",
        authors: paper.authors || [],
        year: paper.published ? new Date(paper.published).getFullYear() : (paper.year || 2023),
        citations: paper.citations || 0,
        url: paper.url || paper.pdf_url || `https://arxiv.org/abs/${paper.arxiv_id || paper.id}`,
        topics: paper.categories || paper.topics || [],
        institution: paper.institution || paper.primary_category,
        qualityScore: paper.quality_score || Math.floor(Math.random() * 30) + 70,
        relevanceScore: paper.relevance_score || Math.floor(Math.random() * 20) + 80,
        // Store original data for later saving
        _originalData: {
          arxiv_id: paper.arxiv_id || paper.id,
          title: paper.title,
          abstract: paper.summary || paper.abstract || "",
          authors: paper.authors || [],
          year: paper.published ? new Date(paper.published).getFullYear() : (paper.year || 2023),
          citations: paper.citations || 0,
          pdf_url: paper.url || paper.pdf_url || `https://arxiv.org/abs/${paper.arxiv_id || paper.id}`,
          topics: paper.categories || paper.topics || [],
          institution: paper.institution || paper.primary_category
        }
      }));
      
      setResults(transformedResults);
      
      // Store search info for display
      const response = searchResponse as any;
      setLastSearchInfo({
        strategiesUsed: response.query_strategies?.map((s: any) => s.name || s.query) || [],
        processingTime: response.processing_time ? `${response.processing_time.toFixed(2)}s` : undefined,
        totalCandidates: response.total_candidates || transformedResults.length
      });
      
      // Log search session info for debugging
      console.log(`Intelligent search completed: ${transformedResults.length} papers found in ${response.processing_time || 'unknown'} seconds`);
      if (response.query_strategies) {
        console.log(`Search strategies used: ${response.query_strategies.length} strategies`);
      }
      
    } catch (error) {
      console.error('Intelligent search error:', error);
      
      // Fallback to mock data with proper UUIDs
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
    if (selectedPapers.size === 0) {
      alert("Please select at least one paper to create a knowledge base.");
      return;
    }

    if (!knowledgebaseName.trim()) {
      alert("Please enter a name for your knowledge base.");
      return;
    }

    try {
      setIsCreatingKB(true);
      
      // Get the selected papers 
      const selectedPaperData = results.filter(p => selectedPapers.has(p.id));
      console.log('Selected papers for KB:', selectedPaperData);
      
      // Download and upload each paper to get real UUIDs
      const realPaperIds = [];
      for (const paper of selectedPaperData) {
        try {
          console.log('Downloading PDF for:', paper.title, 'from:', paper.url);
          
          // Download the PDF using backend proxy (bypasses CORS)
          const pdfResponse = await fetch(`http://localhost:8000/api/download-pdf?url=${encodeURIComponent(paper.url)}`);
          if (!pdfResponse.ok) {
            console.warn('Failed to download PDF for:', paper.title);
            continue;
          }
          
          const pdfBlob = await pdfResponse.blob();
          
          // Create FormData with the PDF file
          const formData = new FormData();
          formData.append('file', pdfBlob, `${paper.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
          formData.append('title', paper.title);
          formData.append('authors', paper.authors.join(','));
          formData.append('abstract', paper.abstract);
          formData.append('year', paper.year.toString());
          formData.append('topics', paper.topics.join(','));
          
          const savedPaper = await apiClient.uploadPaper(formData);
          realPaperIds.push(savedPaper.paper.id);
          console.log('Uploaded paper, got UUID:', savedPaper.paper.id);
        } catch (error) {
          console.warn('Failed to download/upload paper:', paper.title, error);
        }
      }
      
      if (realPaperIds.length === 0) {
        alert("Failed to upload papers. Please try again.");
        return;
      }
      
      // Create KB with real UUIDs
      const knowledgebaseData = {
        name: knowledgebaseName.trim(),
        description: knowledgebaseDescription.trim() || `Knowledge base with ${realPaperIds.length} papers on: ${searchQuery}`,
        papers: realPaperIds,
        tags: [searchQuery, ...getKnowledgebaseComposition().topTopics.slice(0, 5)],
        is_public: false
      };

      console.log('Creating KB with real UUIDs:', knowledgebaseData);
      
      const response = await apiClient.createKnowledgebase(knowledgebaseData);
      
      console.log('KB created successfully:', response);
      
      // Reset form
      setKnowledgebaseName("");
      setKnowledgebaseDescription("");
      setSelectedPapers(new Set());
      
      alert(`Successfully created knowledge base "${knowledgebaseData.name}" with ${realPaperIds.length} papers!`);
      
      window.location.href = '/knowledge-canvas';
      
    } catch (error) {
      console.error('Error creating knowledge base:', error);
      alert(`Failed to create knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingKB(false);
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

  const handlePaperClick = (paper: Paper) => {
    togglePaperSelection(paper.id);
  };

  const filteredResults = showOnlyHighQuality
    ? results.filter((p) => (p.qualityScore || 0) >= 90)
    : results;

  const allVisibleSelected = filteredResults.length > 0 && filteredResults.every(p => selectedPapers.has(p.id));
  const handleToggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      // Deselect all visible
      const newSelected = new Set(selectedPapers);
      filteredResults.forEach(p => newSelected.delete(p.id));
      setSelectedPapers(newSelected);
    } else {
      // Select all visible
      const allIds = new Set([...selectedPapers, ...filteredResults.map(p => p.id)]);
      setSelectedPapers(allIds);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] pt-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 200, 0],
            y: [0, -100, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 120, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"
        />

        {/* Floating Icons */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 opacity-10"
        >
          <Search size={40} className="text-emerald-400" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -12, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-32 right-32 opacity-10"
        >
          <Brain size={36} className="text-blue-400" />
        </motion.div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Research Agent Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/[0.05] border border-white/[0.1] rounded-xl">
              <FileText className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Find Papers on {knowledgebaseName || "Research Topics"}
              </h1>
              <p className="text-white/60">
                AI-powered academic research discovery and analysis
              </p>
            </div>
          </div>

          {/* Clean Search Bar */}
          <div className="space-y-4">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <textarea
                    placeholder="What research question would you like to explore? Be as detailed as you want..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.max(44, e.target.scrollHeight) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-white placeholder:text-white/50 resize-none focus:outline-none text-base font-medium leading-relaxed min-h-[44px]"
                    rows={1}
                    style={{ height: '44px' }}
                  />
                </div>
                <Button
                  onClick={() => handleSearch()}
                  disabled={isLoading || !searchQuery.trim()}
                  className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </div>

            {/* Example Query Cards */}
            {!hasSearched && (
              <div className="space-y-3">
                <p className="text-white/60 text-sm">Try these research questions:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "How do attention mechanisms improve neural machine translation compared to traditional sequence-to-sequence models?",
                    "What are the latest advances in few-shot learning for computer vision and how do they compare to traditional supervised learning?",
                    "How does BERT compare to other pre-trained language models like GPT and RoBERTa in terms of performance and efficiency?",
                    "What are the key innovations in generative adversarial networks that have led to more stable training?"
                  ].map((example, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setSearchQuery(example);
                        // Trigger auto-resize
                        setTimeout(() => {
                          const textarea = document.querySelector('textarea');
                          if (textarea) {
                            textarea.style.height = 'auto';
                            textarea.style.height = Math.max(44, textarea.scrollHeight) + 'px';
                          }
                        }, 0);
                      }}
                      className="p-4 bg-white/[0.02] hover:bg-white/[0.05] text-white/70 hover:text-white rounded-lg transition-all border border-white/[0.05] hover:border-white/[0.08] text-left text-sm h-full"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full mt-2 flex-shrink-0" />
                        <span className="leading-relaxed">{example}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Results Section with Bounded Height */}
        {hasSearched ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-[calc(100vh-300px)] flex flex-col"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-white">
                  {isLoading ? "Searching academic databases..." : `${results.length} Sources`}
                </h2>
                {!isLoading && results.length > 0 && (
                  <div className="flex items-center gap-3">
                    <select className="bg-white/[0.05] border border-white/[0.08] rounded text-white text-sm px-3 py-1.5">
                      <option>Most relevant</option>
                      <option>Most cited</option>
                      <option>Most recent</option>
                    </select>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <span>Scholarly papers only</span>
                      <div className="w-8 h-4 bg-emerald-500 rounded-full relative cursor-pointer">
                        <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {results.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="bg-white/[0.05] border-white/[0.08] text-white hover:bg-white/[0.08] h-8"
                  >
                    {viewMode === 'grid' ? <List size={14} /> : <Grid3X3 size={14} />}
                    <span className="ml-2">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleSelectAllVisible}
                    className="bg-white/[0.05] border-white/[0.08] text-white hover:bg-white/[0.08] h-8"
                  >
                    {selectedPapers.size === results.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              )}
            </div>

            {/* Knowledge Base Creation Banner */}
            {selectedPapers.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-lg flex-shrink-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-white font-semibold">Ready to Create Knowledge Base</h3>
                      <p className="text-white/60 text-sm">
                        {selectedPapers.size} papers selected • Avg Quality: {getKnowledgebaseComposition().avgQuality.toFixed(1)}/10
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Enter knowledge base name..."
                        value={knowledgebaseName}
                        onChange={(e) => setKnowledgebaseName(e.target.value)}
                        className="w-64 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/40 h-9"
                      />
                      <Button
                        onClick={createKnowledgebase}
                        disabled={isCreatingKB || !knowledgebaseName.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-6"
                      >
                        {isCreatingKB ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin h-4 w-4" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            <span>Create Knowledge Base</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Research Results with Fixed Height */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
              {/* Main Results - Scrollable */}
              <div className="lg:col-span-3 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="mx-auto mb-4"
                        >
                          <Loader2 className="h-8 w-8 text-emerald-500" />
                        </motion.div>
                        <p className="text-white/80">Analyzing academic databases...</p>
                        <p className="text-white/60 text-sm">Searching arXiv, PubMed, IEEE, ACM...</p>
                      </div>
                    </div>
                  ) : results.length > 0 ? (
                    <div className={cn(
                      "gap-4",
                      viewMode === 'grid' ? "grid grid-cols-1 xl:grid-cols-2" : "space-y-4"
                    )}>
                      {results.map((paper, index) => (
                        <motion.div
                          key={paper.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "bg-white/[0.02] border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer",
                            selectedPapers.has(paper.id) && "ring-1 ring-emerald-500/50 bg-emerald-500/5",
                            viewMode === 'list' ? "p-6" : "p-4"
                          )}
                          onClick={() => handlePaperClick(paper)}
                        >
                          {/* Paper Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-bold text-white/60 w-6">
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                                  arxiv.org
                                </Badge>
                                <Badge variant="outline" className="border-white/[0.08] text-white/60 text-xs">
                                  {paper.year}
                                </Badge>
                                {paper.qualityScore && (
                                  <Badge className={getQualityBadge(paper.qualityScore).color + " text-xs"}>
                                    {getQualityBadge(paper.qualityScore).label}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedPapers.has(paper.id) ? (
                                <CheckSquare className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Square className="h-4 w-4 text-white/40" />
                              )}
                            </div>
                          </div>

                          {/* Paper Title */}
                          <h3 className={cn(
                            "font-semibold text-white mb-3 leading-tight",
                            viewMode === 'list' ? "text-lg" : "text-base"
                          )}>
                            {paper.title}
                          </h3>

                          {/* Paper Abstract */}
                          <p className={cn(
                            "text-white/70 leading-relaxed mb-4",
                            viewMode === 'list' ? "text-sm line-clamp-3" : "text-xs line-clamp-2"
                          )}>
                            {paper.abstract}
                          </p>

                          {/* Paper Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-white/60">
                              <span>{paper.authors?.[0]} et al.</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                <span>{paper.citations?.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white h-7 text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                PDF
                              </Button>
                              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white h-7 text-xs">
                                Cite
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60 text-lg">No papers found</p>
                        <p className="text-white/40">Try a different research question</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar - Research Context */}
              <div className="lg:col-span-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4">
                  {/* Query Analysis */}
                  {hasSearched && (
                    <Card className="bg-white/[0.02] border-white/[0.08]">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-semibold text-white mb-3">Research Analysis</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-white/60 mb-2">Query Understanding</p>
                            <p className="text-white text-xs leading-relaxed line-clamp-3">
                              {searchQuery}
                            </p>
                          </div>
                          {results.length > 0 && (
                            <div className="pt-3 border-t border-white/[0.08]">
                              <p className="text-xs text-white/60 mb-2">Key Topics Found</p>
                              <div className="flex flex-wrap gap-1">
                                {Array.from(new Set(results.flatMap(p => p.topics).slice(0, 4))).map(topic => (
                                  <Badge key={topic} variant="secondary" className="bg-indigo-500/20 text-indigo-300 text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Selection Stats */}
                  {selectedPapers.size > 0 && (
                    <Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/20">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-semibold text-white mb-3">Selection Stats</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Papers Selected</span>
                            <span className="text-white font-medium">{selectedPapers.size}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Avg Quality Score</span>
                            <span className="text-white font-medium">{getKnowledgebaseComposition().avgQuality.toFixed(1)}/10</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Year Range</span>
                            <span className="text-white font-medium">
                              {getKnowledgebaseComposition().yearRange ? 
                                `${getKnowledgebaseComposition().yearRange?.min}-${getKnowledgebaseComposition().yearRange?.max}` : 
                                'Various'
                              }
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Welcome State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center py-20"
          >
            <FileText className="h-16 w-16 text-white/40 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Start Your Research Journey
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto mb-8">
              Ask any research question and I'll find the most relevant academic papers, 
              analyze their quality, and help you build a comprehensive knowledge base.
            </p>
          </motion.div>
        )}
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