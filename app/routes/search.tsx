import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Search, Loader2, ArrowRight, Sparkles, FileText, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { AuthGuard } from "~/components/auth-guard";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Search Papers - DelphiX" },
    { name: "description", content: "Search and discover research papers with AI-powered insights" },
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
}

// Mock data for demonstration
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
    institution: "Google"
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
    institution: "Google"
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
    institution: "Microsoft Research"
  }
];

function SearchPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Paper[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Filter mock papers based on search query
      const filteredPapers = MOCK_PAPERS.filter(paper => 
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        paper.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setResults(filteredPapers);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const suggestions = ["transformer architecture", "attention mechanism", "BERT", "neural networks", "computer vision"];

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Hero Search Section */}
      <div className={cn(
        "transition-all duration-700 ease-out",
        hasSearched ? "pt-20 pb-8" : "pt-32 pb-16 min-h-screen flex items-center"
      )}>
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={cn(
              "text-center transition-all duration-700",
              hasSearched ? "mb-8" : "mb-12"
            )}
          >
            {!hasSearched && (
              <>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Sparkles className="h-6 w-6 text-indigo-400" />
                  <span className="text-indigo-400 font-medium">AI-Powered Research</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Search Academic Literature
                </h1>
                <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12">
                  Discover research papers, analyze findings, and explore connections with intelligent search powered by AI.
                </p>
              </>
            )}
          </motion.div>

          {/* Search Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-rose-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex items-center">
                <Search className="absolute left-6 text-white/40 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search papers, authors, topics, or ask a question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "w-full pl-14 pr-32 py-4 rounded-2xl text-lg",
                    "bg-white/[0.05] backdrop-blur-sm border border-white/[0.1]",
                    "text-white placeholder:text-white/40",
                    "focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.2]",
                    "transition-all duration-300"
                  )}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className={cn(
                    "absolute right-3 px-6 py-2.5 rounded-xl",
                    "bg-gradient-to-r from-indigo-500 to-rose-500",
                    "text-white font-medium",
                    "hover:shadow-lg hover:shadow-indigo-500/25",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-300 flex items-center gap-2"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span>Search</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {!hasSearched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-6 mt-6 text-sm flex-wrap"
              >
                <span className="text-white/40">Try:</span>
                {suggestions.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors bg-white/[0.02] px-3 py-1 rounded-lg border border-white/[0.05] hover:border-white/[0.1]"
                  >
                    {term}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="container mx-auto px-4 max-w-4xl pb-16">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-16"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                <span className="text-white/80">Searching the research database...</span>
              </div>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold">
                  Found {results.length} papers for "{searchQuery}"
                </h2>
                <div className="text-sm text-white/60">
                  Showing most relevant results
                </div>
              </div>

              {results.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-300 transition-colors">
                        {paper.title}
                      </h3>
                      <p className="text-white/70 mb-4 line-clamp-3 leading-relaxed">
                        {paper.abstract}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {paper.topics.map((topic) => (
                          <span
                            key={topic}
                            className="px-2 py-1 rounded-lg text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-white/60">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{paper.authors.slice(0, 2).join(", ")}{paper.authors.length > 2 ? ` +${paper.authors.length - 2} more` : ""}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{paper.year}</span>
                          </div>
                          <span>{paper.citations.toLocaleString()} citations</span>
                        </div>
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                        >
                          <span>View Paper</span>
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <Search className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No papers found</h3>
                <p className="text-white/60 mb-6">
                  Try adjusting your search terms or explore different topics.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setHasSearched(false);
                    setResults([]);
                  }}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white/80 hover:bg-white/[0.08] transition-all"
                >
                  Start New Search
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
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