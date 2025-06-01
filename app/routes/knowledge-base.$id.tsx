import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  Position,
  Handle,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  ArrowLeft, Search, Eye, Download, Share, Grid3X3, List, Network,
  Star, Tag, BookOpen, TrendingUp, Calendar, GitBranch,
  Sparkles, Target, Clock, Award, BarChart3, Activity,
  RefreshCw, Link2, Brain, MessageCircle, Zap
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from '~/lib/utils';
import { AuthGuard } from "~/components/auth-guard";


export const meta: MetaFunction = () => {
  return [
    { title: "Knowledge Base Viewer - DelphiX" },
    { name: "description", content: "Explore papers and discover deep connections in your knowledge base" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  
  // Mock knowledge base data - replace with actual database calls
  const mockKnowledgeBase = {
    id: id,
    name: "Transformer Architecture Research",
    description: "Comprehensive study of transformer models and their applications across NLP, computer vision, and beyond",
    paper_count: 24,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
    tags: ["Transformers", "NLP", "Attention Mechanism", "BERT", "GPT"],
    status: "active",
    papers: [
      {
        id: "1",
        title: "Attention Is All You Need",
        authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"],
        year: 2017,
        citations: 85420,
        abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
        venue: "NIPS",
        topics: ["Attention", "Transformers", "Machine Translation"],
        qualityScore: 9.8,
        connections: ["2", "3", "5"],
        keyInsights: ["Introduction of the Transformer architecture", "Self-attention mechanism", "Parallel processing"]
      },
      {
        id: "2", 
        title: "BERT: Pre-training of Deep Bidirectional Transformers",
        authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee"],
        year: 2018,
        citations: 67890,
        abstract: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations...",
        venue: "NAACL",
        topics: ["BERT", "Pre-training", "Bidirectional", "Language Model"],
        qualityScore: 9.5,
        connections: ["1", "4", "6"],
        keyInsights: ["Bidirectional training", "Pre-training + fine-tuning", "Context understanding"]
      },
      {
        id: "3",
        title: "GPT-3: Language Models are Few-Shot Learners", 
        authors: ["Tom B. Brown", "Benjamin Mann", "Nick Ryder"],
        year: 2020,
        citations: 45670,
        abstract: "Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training...",
        venue: "NIPS",
        topics: ["GPT", "Few-shot Learning", "Large Language Models"],
        qualityScore: 9.7,
        connections: ["1", "2", "7"],
        keyInsights: ["In-context learning", "Scale effects", "Emergent abilities"]
      },
      {
        id: "4",
        title: "Vision Transformer (ViT): An Image is Worth 16x16 Words",
        authors: ["Alexey Dosovitskiy", "Lucas Beyer", "Alexander Kolesnikov"],
        year: 2020,
        citations: 32450,
        abstract: "While the Transformer architecture has become the de-facto standard for natural language processing...",
        venue: "ICLR",
        topics: ["Vision Transformer", "Computer Vision", "Image Classification"],
        qualityScore: 9.2,
        connections: ["1", "5"],
        keyInsights: ["Transformers for vision", "Patch embeddings", "Transfer from NLP"]
      },
      {
        id: "5",
        title: "Scaling Laws for Neural Language Models",
        authors: ["Jared Kaplan", "Sam McCandlish", "Tom Henighan"],
        year: 2020,
        citations: 18930,
        abstract: "We study empirical scaling laws for language model performance on the cross-entropy loss...",
        venue: "ArXiv",
        topics: ["Scaling Laws", "Language Models", "Performance"],
        qualityScore: 8.9,
        connections: ["1", "3", "4"],
        keyInsights: ["Performance scaling", "Compute requirements", "Model size effects"]
      }
    ]
  };

  return json({ knowledgeBase: mockKnowledgeBase });
}

interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  citations: number;
  abstract: string;
  venue: string;
  topics: string[];
  qualityScore: number;
  connections: string[];
  keyInsights: string[];
}

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  paper_count: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  status: string;
  papers: Paper[];
}

export default function KnowledgeBaseViewer() {
  const { knowledgeBase } = useLoaderData<{ knowledgeBase: KnowledgeBase }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'network'>('grid');
  const [filterTopic, setFilterTopic] = useState<string | null>(null);

  // Derived state
  const filteredPapers = useMemo(() => {
    return knowledgeBase.papers.filter(paper => {
      const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           paper.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           paper.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTopic = !filterTopic || paper.topics.includes(filterTopic);
      
      return matchesSearch && matchesTopic;
    });
  }, [knowledgeBase.papers, searchQuery, filterTopic]);

  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    knowledgeBase.papers.forEach(paper => {
      paper.topics.forEach(topic => topics.add(topic));
    });
    return Array.from(topics);
  }, [knowledgeBase.papers]);

  const insights = useMemo(() => {
    const totalCitations = knowledgeBase.papers.reduce((sum, paper) => sum + paper.citations, 0);
    const avgQuality = knowledgeBase.papers.reduce((sum, paper) => sum + paper.qualityScore, 0) / knowledgeBase.papers.length;
    const yearRange = {
      min: Math.min(...knowledgeBase.papers.map(p => p.year)),
      max: Math.max(...knowledgeBase.papers.map(p => p.year))
    };
    const topVenues = knowledgeBase.papers.reduce((acc, paper) => {
      acc[paper.venue] = (acc[paper.venue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCitations,
      avgQuality: Math.round(avgQuality * 10) / 10,
      yearRange,
      topVenues: Object.entries(topVenues).sort(([,a], [,b]) => b - a).slice(0, 3)
    };
  }, [knowledgeBase.papers]);

  const getQualityColor = (score: number) => {
    if (score >= 9.5) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    if (score >= 9.0) return "bg-green-500/20 text-green-300 border-green-500/30";
    if (score >= 8.5) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-orange-500/20 text-orange-300 border-orange-500/30";
  };

  const getQualityColorHex = (score: number) => {
    if (score >= 9.5) return "#10b981";
    if (score >= 9.0) return "#84cc16";  
    if (score >= 8.5) return "#eab308";
    return "#f97316";
  };

// Research Explorer Component - Intelligent research insights
function ResearchExplorer({ knowledgeBase }: { knowledgeBase: KnowledgeBase }) {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock intelligent insights that would come from LLM analysis
  const mockInsights = [
    {
      id: "1",
      type: "trend",
      title: "Evolution of Transformer Architecture",
      description: "Papers show clear progression from basic attention mechanisms to advanced applications",
      keyPapers: ["1", "2", "3"],
      insight: "The research shows a clear evolution from Vaswani et al.'s foundational work to specialized applications in vision and language modeling. The progression suggests attention mechanisms are becoming the dominant paradigm.",
      confidence: 0.92,
      citations: 198930,
      icon: TrendingUp,
      color: "text-blue-400"
    },
    {
      id: "2", 
      type: "gap",
      title: "Efficiency vs Performance Trade-off",
      description: "Research gap identified in efficient transformer architectures for resource-constrained environments",
      keyPapers: ["4", "5"],
      insight: "While scaling laws show performance improvements with model size, there's limited research on maintaining efficiency for deployment. This represents a significant opportunity.",
      confidence: 0.87,
      citations: 51380,
      icon: Zap,
      color: "text-yellow-400"
    },
    {
      id: "3",
      type: "connection",
      title: "Vision-Language Model Convergence", 
      description: "Strong thematic connections between computer vision and NLP transformer applications",
      keyPapers: ["1", "4"],
      insight: "ViT's success in computer vision directly builds on transformer foundations, suggesting unified architectures for multimodal AI are emerging.",
      confidence: 0.95,
      citations: 117870,
      icon: Link2,
      color: "text-green-400"
    },
    {
      id: "4",
      type: "emerging",
      title: "Scaling Laws and Emergence",
      description: "Consistent patterns in how performance scales with model size across domains",
      keyPapers: ["3", "5"],
      insight: "Scaling laws appear universal across language and vision domains. Papers suggest emergent capabilities arise at predictable scale thresholds.",
      confidence: 0.89,
      citations: 64600,
      icon: BarChart3,
      color: "text-purple-400"
    }
  ];

  const handleGenerateInsights = () => {
    setIsGenerating(true);
    // Simulate AI analysis
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Research Insights</h3>
          <p className="text-white/60">
            AI-powered analysis of {knowledgeBase.papers.length} papers revealing key patterns and opportunities
          </p>
        </div>
        
        <Button
          onClick={handleGenerateInsights}
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Insights
            </>
          )}
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-4"
      >
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-white/60 text-sm">Research Trends</span>
          </div>
          <p className="text-white text-2xl font-bold">4</p>
          <p className="text-white/50 text-xs">patterns identified</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-yellow-400" />
            <span className="text-white/60 text-sm">Research Gaps</span>
          </div>
          <p className="text-white text-2xl font-bold">2</p>
          <p className="text-white/50 text-xs">opportunities found</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="h-4 w-4 text-green-400" />
            <span className="text-white/60 text-sm">Key Connections</span>
          </div>
          <p className="text-white text-2xl font-bold">8</p>
          <p className="text-white/50 text-xs">strong relationships</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-white/60 text-sm">Emerging Areas</span>
          </div>
          <p className="text-white text-2xl font-bold">3</p>
          <p className="text-white/50 text-xs">future directions</p>
        </div>
      </motion.div>

      {/* Main Insights Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {mockInsights.map((insight, index) => (
          <Card 
            key={insight.id}
            className={cn(
              "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300 cursor-pointer",
              selectedInsight === insight.id && "ring-2 ring-indigo-500 bg-indigo-500/5"
            )}
            onClick={() => setSelectedInsight(selectedInsight === insight.id ? null : insight.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <insight.icon className={cn("h-5 w-5", insight.color)} />
                  <Badge variant="outline" className="text-xs border-white/[0.1] text-white/60 capitalize">
                    {insight.type}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/60">Confidence</div>
                  <div className="text-sm font-semibold text-white">
                    {Math.round(insight.confidence * 100)}%
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                  <p className="text-white/70 text-sm">{insight.description}</p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{insight.keyPapers.length} key papers</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{insight.citations.toLocaleString()} citations</span>
                  </div>
                </div>
                
                {selectedInsight === insight.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-3 border-t border-white/[0.1]"
                  >
                    <p className="text-white/80 text-sm leading-relaxed mb-3">
                      {insight.insight}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="text-xs text-white/60 font-medium">Key Papers:</div>
                      {insight.keyPapers.map(paperId => {
                        const paper = knowledgeBase.papers.find(p => p.id === paperId);
                        return paper ? (
                          <div key={paperId} className="p-2 bg-white/[0.02] border border-white/[0.05] rounded text-sm">
                            <p className="text-white/80 font-medium line-clamp-1">{paper.title}</p>
                            <p className="text-white/60 text-xs">
                              {paper.authors[0]} et al. ({paper.year}) • {paper.citations.toLocaleString()} citations
                            </p>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Research Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Suggested Research Questions
            </CardTitle>
            <CardDescription className="text-white/60">
              AI-generated questions based on gaps and patterns in your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "How can transformer efficiency be improved for mobile deployment while maintaining performance?",
                "What are the theoretical limits of scaling laws in transformer architectures?", 
                "How do attention patterns differ between vision and language tasks?",
                "What hybrid architectures could combine the benefits of transformers and CNNs?"
              ].map((question, index) => (
                <div 
                  key={index}
                  className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-500/20 text-indigo-400 rounded-full p-1 mt-0.5">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{question}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Custom Paper Node Component
function PaperNode({ data, selected }: { data: any; selected?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getQualityColor = (score: number) => {
    if (score >= 9.5) return "#10b981"; // emerald-500
    if (score >= 9.0) return "#84cc16"; // lime-500  
    if (score >= 8.5) return "#eab308"; // yellow-500
    return "#f97316"; // orange-500
  };

  const nodeWidth = isHovered ? 320 : Math.max(140, Math.min(200, Math.sqrt(data.citations / 50) + 120));
  const nodeHeight = isHovered ? 200 : Math.max(80, Math.min(120, Math.sqrt(data.citations / 100) + 60));

  return (
    <div 
      className={cn(
        "paper-node relative bg-gray-900/95 backdrop-blur border-2 rounded-xl p-4 transition-all duration-500 cursor-pointer shadow-2xl",
        "hover:shadow-3xl hover:scale-105",
        selected && "ring-2 ring-blue-400 bg-blue-900/20",
        isHovered && "z-50 shadow-blue-500/20"
      )}
      style={{ 
        borderColor: getQualityColor(data.qualityScore),
        width: nodeWidth,
        height: nodeHeight,
        boxShadow: isHovered ? `0 20px 40px ${getQualityColor(data.qualityScore)}20` : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-white bg-gray-800" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-white bg-gray-800" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-white bg-gray-800" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-white bg-gray-800" />
      
      <div className="text-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className={cn(
              "font-semibold leading-tight text-white",
              isHovered ? "text-sm" : "text-xs",
              isHovered ? "line-clamp-3" : "line-clamp-2"
            )}>
              {isHovered ? data.title : (data.title.length > 30 ? data.title.substring(0, 30) + '...' : data.title)}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {data.authors[0]}{data.authors.length > 1 ? ' et al.' : ''} • {data.year}
            </div>
          </div>
          
          <div 
            className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold text-white ml-2 flex-shrink-0"
            style={{ backgroundColor: getQualityColor(data.qualityScore) }}
          >
            {data.qualityScore}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Abstract */}
              <div>
                <p className="text-gray-300 text-xs leading-relaxed line-clamp-4">
                  {data.abstract}
                </p>
              </div>
              
              {/* Topics */}
              <div className="flex flex-wrap gap-1">
                {data.topics.slice(0, 3).map((topic: string) => (
                  <span 
                    key={topic}
                    className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-gray-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              
              {/* Venue */}
              <div className="text-xs text-gray-400">
                Published in {data.venue}
              </div>
            </motion.div>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{data.citations > 1000 ? `${Math.round(data.citations / 1000)}k` : data.citations}</span>
              </div>
              {data.connections && (
                <div className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  <span>{data.connections}</span>
                </div>
              )}
            </div>
            
            {isHovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle click to show full details
                }}
              >
                View Details
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// React Flow Mind Map Component
function ReactFlowMindMap({ knowledgeBase }: { knowledgeBase: KnowledgeBase }) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  const nodeTypes = useMemo(() => ({ 
    paperNode: (props: any) => (
      <PaperNode 
        {...props} 
        selected={selectedNode === props.id}
        onSelect={setSelectedNode}
        onHover={setHoveredNode}
      />
    )
  }), [selectedNode]);

  // Generate initial nodes and edges
  const initialNodes: Node[] = useMemo(() => {
    const papers = knowledgeBase.papers;
    const centerX = 400;
    const centerY = 300;
    const radius = 250;

    return papers.map((paper, index) => {
      const angle = (index / papers.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      return {
        id: paper.id,
        type: 'paperNode',
        position: { x, y },
        data: {
          title: paper.title,
          authors: paper.authors,
          year: paper.year,
          citations: paper.citations,
          qualityScore: paper.qualityScore,
          topics: paper.topics,
          venue: paper.venue,
          abstract: paper.abstract,
          connections: paper.connections.length,
          keyInsights: paper.keyInsights
        },
        draggable: true,
      };
    });
  }, [knowledgeBase.papers]);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    knowledgeBase.papers.forEach(paper => {
      paper.connections.forEach(connectionId => {
        // Only create edge if target paper exists and avoid duplicates
        const targetPaper = knowledgeBase.papers.find(p => p.id === connectionId);
        if (targetPaper && paper.id < connectionId) { // Avoid duplicate edges
          const isHighlighted = selectedNode === paper.id || selectedNode === connectionId || 
                               hoveredNode === paper.id || hoveredNode === connectionId;
          
          edges.push({
            id: `${paper.id}-${connectionId}`,
            source: paper.id,
            target: connectionId,
            style: { 
              stroke: isHighlighted ? '#3b82f6' : '#6366f1', 
              strokeWidth: isHighlighted ? 3 : 2,
              strokeOpacity: isHighlighted ? 1 : 0.4 
            },
            animated: isHighlighted,
          });
        }
      });
    });
    return edges;
  }, [knowledgeBase.papers, selectedNode, hoveredNode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update edges when selection changes
  useEffect(() => {
    setEdges(initialEdges);
  }, [selectedNode, hoveredNode, setEdges, initialEdges]);

  const onNodeClick = useCallback((event: any, node: Node) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
  }, [selectedNode]);

  const selectedPaper = useMemo(() => {
    return selectedNode ? knowledgeBase.papers.find(p => p.id === selectedNode) : null;
  }, [selectedNode, knowledgeBase.papers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Knowledge Connection Map</h3>
          <p className="text-white/60">
            Interactive network visualization showing relationships between {knowledgeBase.papers.length} papers
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            size="sm" 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => {
              // Reset to circular layout
              const centerX = 400;
              const centerY = 300;
              const radius = 200;
              
              const newNodes = nodes.map((node, index) => {
                const angle = (index / nodes.length) * 2 * Math.PI;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                return { ...node, position: { x, y } };
              });
              setNodes(newNodes);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Layout
          </Button>
        </div>
      </motion.div>

             {/* React Flow Container */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="grid grid-cols-1 lg:grid-cols-3 gap-6"
       >
         {/* Main Mind Map */}
         <div className="lg:col-span-2">
           <div 
             className="bg-white/[0.02] border border-white/[0.08] rounded-lg overflow-hidden"
             style={{ height: '600px' }}
           >
             <ReactFlow
               nodes={nodes}
               edges={edges}
               onNodesChange={onNodesChange}
               onEdgesChange={onEdgesChange}
               onNodeClick={onNodeClick}
               nodeTypes={nodeTypes}
               fitView
               fitViewOptions={{ padding: 0.2 }}
               style={{ background: '#030303' }}
               nodesDraggable={true}
               nodesConnectable={false}
               elementsSelectable={true}
             >
               <Background 
                 variant={BackgroundVariant.Dots} 
                 gap={20} 
                 size={1}
                 color="#ffffff10"
               />
               <Controls 
                 style={{
                   background: 'rgba(0, 0, 0, 0.8)',
                   border: '1px solid rgba(255, 255, 255, 0.1)',
                 }}
               />
             </ReactFlow>
           </div>
         </div>

         {/* Detail Panel */}
         <div className="lg:col-span-1">
           <Card className="bg-white/[0.02] border-white/[0.08] h-[600px] overflow-y-auto">
             <CardHeader>
               <CardTitle className="text-white text-lg flex items-center gap-2">
                 <BookOpen className="h-5 w-5" />
                 {selectedPaper ? 'Paper Details' : 'Select a Paper'}
               </CardTitle>
             </CardHeader>
             <CardContent>
               {selectedPaper ? (
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-4"
                 >
                   {/* Title and Authors */}
                   <div>
                     <h3 className="text-white font-semibold text-base leading-tight mb-2">
                       {selectedPaper.title}
                     </h3>
                     <p className="text-white/70 text-sm">
                       {selectedPaper.authors.join(', ')}
                     </p>
                     <p className="text-white/60 text-sm">
                       {selectedPaper.venue} • {selectedPaper.year}
                     </p>
                   </div>

                   {/* Quality and Citations */}
                   <div className="flex items-center gap-4">
                     <Badge className={cn("text-xs", getQualityColor(selectedPaper.qualityScore))}>
                       Quality: {selectedPaper.qualityScore}
                     </Badge>
                     <div className="flex items-center gap-1 text-white/60 text-sm">
                       <Star className="h-4 w-4" />
                       <span>{selectedPaper.citations.toLocaleString()} citations</span>
                     </div>
                   </div>

                   {/* Abstract */}
                   <div>
                     <h4 className="text-white font-medium mb-2">Abstract</h4>
                     <p className="text-white/70 text-sm leading-relaxed">
                       {selectedPaper.abstract}
                     </p>
                   </div>

                   {/* Topics */}
                   <div>
                     <h4 className="text-white font-medium mb-2">Topics</h4>
                     <div className="flex flex-wrap gap-1">
                       {selectedPaper.topics.map(topic => (
                         <Badge key={topic} variant="outline" className="text-xs border-white/[0.1] text-white/60">
                           {topic}
                         </Badge>
                       ))}
                     </div>
                   </div>

                   {/* Key Insights */}
                   <div>
                     <h4 className="text-white font-medium mb-2">Key Insights</h4>
                     <ul className="space-y-1">
                       {selectedPaper.keyInsights.map((insight, idx) => (
                         <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                           <span className="text-indigo-400 mt-1">•</span>
                           <span>{insight}</span>
                         </li>
                       ))}
                     </ul>
                   </div>

                   {/* Connected Papers */}
                   {selectedPaper.connections.length > 0 && (
                     <div>
                       <h4 className="text-white font-medium mb-2">Connected Papers</h4>
                       <div className="space-y-2">
                         {selectedPaper.connections.map(connectionId => {
                           const connectedPaper = knowledgeBase.papers.find(p => p.id === connectionId);
                           return connectedPaper ? (
                             <button
                               key={connectionId}
                               className="w-full p-2 bg-white/[0.02] border border-white/[0.05] rounded text-left hover:bg-white/[0.04] transition-colors"
                               onClick={() => setSelectedNode(connectionId)}
                             >
                               <p className="text-white/80 text-sm font-medium line-clamp-1">
                                 {connectedPaper.title}
                               </p>
                               <p className="text-white/60 text-xs">
                                 {connectedPaper.authors[0]} et al. ({connectedPaper.year})
                               </p>
                             </button>
                           ) : null;
                         })}
                       </div>
                     </div>
                   )}
                 </motion.div>
               ) : (
                 <div className="text-center text-white/60 mt-8">
                   <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
                   <p>Click on a paper node to explore its details and connections</p>
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
       </motion.div>

      {/* Connection Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Highly Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {knowledgeBase.papers
                .sort((a, b) => b.connections.length - a.connections.length)
                .slice(0, 3)
                .map(paper => (
                  <div key={paper.id} className="p-2 bg-white/[0.02] border border-white/[0.05] rounded">
                    <p className="text-white/80 text-sm font-medium line-clamp-1">{paper.title}</p>
                    <p className="text-white/60 text-xs">{paper.connections.length} connections</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Most Cited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {knowledgeBase.papers
                .sort((a, b) => b.citations - a.citations)
                .slice(0, 3)
                .map(paper => (
                  <div key={paper.id} className="p-2 bg-white/[0.02] border border-white/[0.05] rounded">
                    <p className="text-white/80 text-sm font-medium line-clamp-1">{paper.title}</p>
                    <p className="text-white/60 text-xs">{paper.citations.toLocaleString()} citations</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Network Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex justify-between">
                <span>Nodes:</span>
                <span className="text-white">{knowledgeBase.papers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Connections:</span>
                <span className="text-white">{knowledgeBase.papers.reduce((sum, p) => sum + p.connections.length, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Degree:</span>
                <span className="text-white">{(knowledgeBase.papers.reduce((sum, p) => sum + p.connections.length, 0) / knowledgeBase.papers.length).toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#030303] pt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Link to="/knowledge-canvas">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Canvas
                </Button>
              </Link>
            </div>
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {knowledgeBase.name}
                </h1>
                <p className="text-white/60 text-lg mb-4">
                  {knowledgeBase.description}
                </p>
                
                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{knowledgeBase.paper_count} papers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{insights.totalCitations.toLocaleString()} total citations</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>{insights.avgQuality}/10 avg quality</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{insights.yearRange.min} - {insights.yearRange.max}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-white/[0.02] border-white/[0.1] text-white">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="bg-white/[0.02] border-white/[0.1] text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <Tabs defaultValue="papers" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/[0.02] border-white/[0.1]">
              <TabsTrigger value="papers" className="data-[state=active]:bg-white/[0.1] text-white">
                Papers
              </TabsTrigger>
              <TabsTrigger value="connections" className="data-[state=active]:bg-white/[0.1] text-white">
                Connections
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-white/[0.1] text-white">
                Insights
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white/[0.1] text-white">
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Papers Tab */}
            <TabsContent value="papers" className="mt-6">
              {/* Search and Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-6"
              >
                <div className="flex gap-4 items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                    <Input
                      placeholder="Search papers by title, author, or content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        "pl-10",
                        "bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/40",
                        "focus:bg-white/[0.08] focus:border-white/[0.2]"
                      )}
                    />
                  </div>
                  
                  <select
                    value={filterTopic || ""}
                    onChange={(e) => setFilterTopic(e.target.value || null)}
                    className="bg-white/[0.05] border border-white/[0.1] text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Topics</option>
                    {allTopics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-9 w-9 p-0"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-9 w-9 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'network' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('network')}
                      className="h-9 w-9 p-0"
                    >
                      <Network className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Papers Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPapers.map((paper) => (
                      <Card
                        key={paper.id}
                        className={cn(
                          "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300 cursor-pointer group",
                          selectedPaper === paper.id && "ring-2 ring-indigo-500 bg-indigo-500/5"
                        )}
                        onClick={() => setSelectedPaper(selectedPaper === paper.id ? null : paper.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-white text-base font-semibold line-clamp-2 group-hover:text-indigo-300 transition-colors">
                              {paper.title}
                            </CardTitle>
                            <Badge className={cn("text-xs", getQualityColor(paper.qualityScore))}>
                              {paper.qualityScore}
                            </Badge>
                          </div>
                          <CardDescription className="text-white/60 text-sm">
                            {paper.authors.slice(0, 2).join(", ")}{paper.authors.length > 2 ? ` +${paper.authors.length - 2}` : ""}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <p className="text-white/70 text-sm line-clamp-3">
                              {paper.abstract}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-white/60">
                              <span>{paper.venue} {paper.year}</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                <span>{paper.citations.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {paper.topics.slice(0, 3).map(topic => (
                                <Badge key={topic} variant="outline" className="text-xs border-white/[0.1] text-white/60">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                            
                            {paper.connections.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-white/60">
                                <GitBranch className="h-3 w-3" />
                                <span>{paper.connections.length} connections</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {filteredPapers.map((paper) => (
                      <Card
                        key={paper.id}
                        className={cn(
                          "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300 cursor-pointer",
                          selectedPaper === paper.id && "ring-2 ring-indigo-500 bg-indigo-500/5"
                        )}
                        onClick={() => setSelectedPaper(selectedPaper === paper.id ? null : paper.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-white text-lg font-semibold hover:text-indigo-300 transition-colors">
                                  {paper.title}
                                </h3>
                                <Badge className={cn("text-xs", getQualityColor(paper.qualityScore))}>
                                  {paper.qualityScore}
                                </Badge>
                              </div>
                              
                              <p className="text-white/60 text-sm mb-2">
                                {paper.authors.join(", ")} • {paper.venue} {paper.year}
                              </p>
                              
                              <p className="text-white/70 text-sm mb-3 line-clamp-2">
                                {paper.abstract}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                  {paper.topics.slice(0, 4).map(topic => (
                                    <Badge key={topic} variant="outline" className="text-xs border-white/[0.1] text-white/60">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-white/60">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    <span>{paper.citations.toLocaleString()}</span>
                                  </div>
                                  {paper.connections.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <GitBranch className="h-3 w-3" />
                                      <span>{paper.connections.length} connections</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {viewMode === 'network' && (
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-8">
                    <div className="text-center">
                      <Network className="h-16 w-16 text-white/40 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Network Visualization</h3>
                      <p className="text-white/60 mb-6">
                        Interactive network view showing connections between papers
                      </p>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Network Map
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="mt-6">
              <ReactFlowMindMap knowledgeBase={knowledgeBase} />
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="mt-6">
              <ResearchExplorer knowledgeBase={knowledgeBase} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white/[0.02] border-white/[0.08]">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Key Themes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {allTopics.slice(0, 5).map(topic => (
                        <div key={topic} className="flex items-center justify-between">
                          <span className="text-white/70">{topic}</span>
                          <Badge variant="outline" className="border-white/[0.1] text-white/60">
                            {knowledgeBase.papers.filter(p => p.topics.includes(topic)).length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/[0.08]">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Top Venues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insights.topVenues.map(([venue, count]) => (
                        <div key={venue} className="flex items-center justify-between">
                          <span className="text-white/70">{venue}</span>
                          <Badge variant="outline" className="border-white/[0.1] text-white/60">
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/[0.08]">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Quality Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Excellent (9.5+)</span>
                        <span className="text-emerald-300">{knowledgeBase.papers.filter(p => p.qualityScore >= 9.5).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">High (9.0+)</span>
                        <span className="text-green-300">{knowledgeBase.papers.filter(p => p.qualityScore >= 9.0 && p.qualityScore < 9.5).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Good (8.5+)</span>
                        <span className="text-yellow-300">{knowledgeBase.papers.filter(p => p.qualityScore >= 8.5 && p.qualityScore < 9.0).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/[0.08] md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Citation Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/60 text-sm">Total Citations</p>
                          <p className="text-white text-2xl font-bold">{insights.totalCitations.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Average Quality</p>
                          <p className="text-white text-2xl font-bold">{insights.avgQuality}/10</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-2">Top Cited Papers</p>
                        <div className="space-y-2">
                          {knowledgeBase.papers
                            .sort((a, b) => b.citations - a.citations)
                            .slice(0, 3)
                            .map(paper => (
                              <div key={paper.id} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/[0.05] rounded">
                                <span className="text-white/80 text-sm line-clamp-1">{paper.title}</span>
                                <span className="text-white/60 text-xs">{paper.citations.toLocaleString()}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/[0.08]">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">First Paper</span>
                        <span className="text-white/60">{insights.yearRange.min}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Latest Paper</span>
                        <span className="text-white/60">{insights.yearRange.max}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Time Span</span>
                        <span className="text-white/60">{insights.yearRange.max - insights.yearRange.min} years</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Selected Paper Sidebar */}
          <AnimatePresence>
            {selectedPaper && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className="fixed right-0 top-0 h-full w-80 bg-[#030303] border-l border-white/[0.1] p-6 overflow-y-auto z-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Paper Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPaper(null)}
                    className="text-white/60 hover:text-white"
                  >
                    ×
                  </Button>
                </div>
                
                {(() => {
                  const paper = knowledgeBase.papers.find(p => p.id === selectedPaper);
                  if (!paper) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">{paper.title}</h4>
                        <p className="text-white/60 text-sm mb-2">
                          {paper.authors.join(", ")}
                        </p>
                        <p className="text-white/60 text-sm">
                          {paper.venue} {paper.year} • {paper.citations.toLocaleString()} citations
                        </p>
                      </div>
                      
                      <div>
                        <Badge className={cn("text-xs", getQualityColor(paper.qualityScore))}>
                          Quality Score: {paper.qualityScore}
                        </Badge>
                      </div>
                      
                      <div>
                        <h5 className="text-white font-medium mb-2">Abstract</h5>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {paper.abstract}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="text-white font-medium mb-2">Topics</h5>
                        <div className="flex flex-wrap gap-1">
                          {paper.topics.map(topic => (
                            <Badge key={topic} variant="outline" className="text-xs border-white/[0.1] text-white/60">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-white font-medium mb-2">Key Insights</h5>
                        <ul className="space-y-1">
                          {paper.keyInsights.map((insight, idx) => (
                            <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                              <span className="text-indigo-400 mt-1">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {paper.connections.length > 0 && (
                        <div>
                          <h5 className="text-white font-medium mb-2">Connected Papers</h5>
                          <div className="space-y-2">
                            {paper.connections.map(connectionId => {
                              const connectedPaper = knowledgeBase.papers.find(p => p.id === connectionId);
                              return connectedPaper ? (
                                <div
                                  key={connectionId}
                                  className="p-2 bg-white/[0.02] border border-white/[0.05] rounded text-sm cursor-pointer hover:bg-white/[0.04]"
                                  onClick={() => setSelectedPaper(connectionId)}
                                >
                                  <p className="text-white/80 font-medium line-clamp-1">
                                    {connectedPaper.title}
                                  </p>
                                  <p className="text-white/60 text-xs">
                                    {connectedPaper.authors[0]} et al. ({connectedPaper.year})
                                  </p>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AuthGuard>
  );
} 