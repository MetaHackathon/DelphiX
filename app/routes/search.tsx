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

      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        {/* Clean Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-3 mt-16">
            Discover Research Papers
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Ask questions and find relevant academic papers with AI-powered semantic search
          </p>
        </motion.div>

        {/* Clean Search Interface */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <textarea
                      placeholder="What research question would you like to explore?"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        // Auto-resize textarea
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.max(50, e.target.scrollHeight) + 'px';
                      }}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent text-white text-lg placeholder:text-white/40 resize-none focus:outline-none leading-relaxed min-h-[50px]"
                      rows={1}
                      style={{ height: '50px' }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSearch()}
                    disabled={isLoading || !searchQuery.trim()}
                    className="px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                    Search
                  </motion.button>
                </div>
              </div>

              {/* Example Queries */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-6"
              >
                <p className="text-white/50 text-sm mb-4 text-center">Try these examples:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    "How do transformers improve NLP tasks?",
                    "What makes attention mechanisms effective?",
                    "How do BERT and GPT architectures compare?",
                    "What are recent breakthroughs in computer vision?"
                  ].map((example, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSearchQuery(example)}
                      className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] text-white/70 hover:text-white rounded-lg transition-all border border-white/[0.08] text-sm"
                    >
                      {example}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-[#030303] pt-20 z-20"
          >
            <div className="h-full flex">
              {/* Left Sidebar - Search Interface */}
              <motion.div
                initial={{ x: -400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-96 bg-white/[0.02] border-r border-white/[0.08] backdrop-blur-sm p-6 flex flex-col"
              >
                {/* Search Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Research Search</h2>
                  <p className="text-white/60 text-sm">AI-powered paper discovery</p>
                </div>

                {/* Search Input */}
                <div className="mb-6">
                  <div className="relative bg-white/[0.05] border border-white/[0.08] rounded-xl p-4">
                    <textarea
                      placeholder="Ask your research question..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.max(40, e.target.scrollHeight) + 'px';
                      }}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent text-white placeholder:text-white/40 resize-none focus:outline-none leading-relaxed min-h-[40px] text-sm"
                      rows={1}
                      style={{ height: '40px' }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSearch()}
                      disabled={isLoading || !searchQuery.trim()}
                      className="mt-3 w-full px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Search
                    </motion.button>
                  </div>
                </div>

                {/* Search Stats */}
                <div className="mb-6 p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">
                      {isLoading ? "Searching..." : `${results.length} Papers`}
                    </span>
                    {!isLoading && results.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleSelectAllVisible}
                        className="bg-white/[0.05] border-white/[0.08] text-white hover:bg-white/[0.08] text-xs h-7"
                      >
                        {selectedPapers.size === results.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    )}
                  </div>
                  
                  {selectedPapers.size > 0 && (
                    <div className="text-xs text-white/60 mb-3">
                      {selectedPapers.size} selected for knowledge base
                    </div>
                  )}
                </div>

                {/* Knowledge Base Creation */}
                {selectedPapers.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl mb-6"
                  >
                    <h3 className="text-white font-medium mb-3 text-sm">Create Knowledge Base</h3>
                    <Input
                      placeholder="Enter name..."
                      value={knowledgebaseName}
                      onChange={(e) => setKnowledgebaseName(e.target.value)}
                      className="w-full bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/40 text-sm h-8 mb-3"
                    />
                    <Button
                      onClick={createKnowledgebase}
                      disabled={isCreatingKB || !knowledgebaseName.trim()}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-8"
                    >
                      {isCreatingKB ? (
                        <Loader2 className="animate-spin h-3 w-3 mr-2" />
                      ) : (
                        <Database className="h-3 w-3 mr-2" />
                      )}
                      Create
                    </Button>
                  </motion.div>
                )}

                {/* Quick Actions */}
                <div className="mt-auto space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setHasSearched(false);
                      setResults([]);
                      setSearchQuery("");
                      setSelectedPapers(new Set());
                    }}
                    className="w-full p-3 bg-white/[0.03] hover:bg-white/[0.05] text-white/70 hover:text-white rounded-lg transition-all border border-white/[0.05] text-sm"
                  >
                    ← New Search
                  </motion.button>
                </div>
              </motion.div>

              {/* Right Side - Papers List */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Papers Header */}
                <div className="p-6 border-b border-white/[0.08] bg-white/[0.01]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">Research Papers</h1>
                      <p className="text-white/60 text-sm">
                        {isLoading ? "Searching academic databases..." : `Found ${results.length} relevant papers`}
                      </p>
                    </div>
                    {selectedPapers.size > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-emerald-400 font-medium">
                          {selectedPapers.size} selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Papers Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="mx-auto mb-4"
                        >
                          <Loader2 className="h-8 w-8 text-white" />
                        </motion.div>
                        <p className="text-white/80 mb-2">Analyzing research databases</p>
                        <p className="text-white/60 text-sm">This may take a few moments...</p>
                      </div>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {results.map((paper, index) => (
                        <motion.div
                          key={paper.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 cursor-pointer transition-all duration-200 group",
                            "hover:bg-white/[0.04] hover:border-white/[0.15] hover:shadow-lg hover:shadow-white/[0.05]",
                            selectedPapers.has(paper.id) && "ring-2 ring-white/30 bg-white/[0.06] border-white/[0.15]"
                          )}
                          onClick={() => handlePaperClick(paper)}
                        >
                          {/* Paper Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-white/30 text-xs font-mono w-8">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs px-2 py-0.5">
                                  {paper.year}
                                </Badge>
                                <Badge className="bg-green-500/20 text-green-300 border-0 text-xs px-2 py-0.5">
                                  {paper.citations?.toLocaleString() || 0}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {selectedPapers.has(paper.id) ? (
                                  <CheckSquare className="h-5 w-5 text-emerald-400" />
                                ) : (
                                  <Square className="h-5 w-5 text-white/30 group-hover:text-white/60" />
                                )}
                              </motion.div>
                            </div>
                          </div>

                          {/* Paper Title */}
                          <h3 className="text-lg font-semibold text-white mb-3 leading-tight group-hover:text-white/90 line-clamp-2">
                            {paper.title}
                          </h3>

                          {/* Paper Abstract */}
                          <p className="text-white/60 mb-4 text-sm leading-relaxed line-clamp-3">
                            {paper.abstract}
                          </p>

                          {/* Paper Footer */}
                          <div className="flex items-center justify-between">
                            <p className="text-white/50 text-xs">
                              {paper.authors?.slice(0, 2).join(', ')}
                              {paper.authors && paper.authors.length > 2 && ` +${paper.authors.length - 2}`}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all h-6 text-xs px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(paper.url, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-white/30 mx-auto mb-4" />
                        <p className="text-white/60 text-lg mb-2">No papers found</p>
                        <p className="text-white/40">Try refining your search query</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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