import type { MetaFunction } from "@remix-run/node";
import { useState, useCallback, useEffect } from "react";
import { Link } from "@remix-run/react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Panel,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Plus, Eye, MessageCircle, Network, Download, Settings, Sparkles, FileText, Users, Zap, Maximize2, User, Calendar, Tag } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { cn } from '~/lib/utils';

export const meta: MetaFunction = () => {
  return [
    { title: "Knowledge Canvas - DataEngineX" },
    { name: "description", content: "Visualize and explore connections between research papers" },
  ];
};

// Custom node component with modern design
const CustomNode = ({ data }: { data: any }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "px-4 py-3 rounded-xl min-w-[250px]",
        "bg-white/[0.05] backdrop-blur-sm border border-white/[0.1]",
        "hover:bg-white/[0.08] hover:border-white/[0.2]",
        "transition-all duration-300 cursor-pointer",
        "shadow-lg shadow-black/10"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          data.type === 'main' 
            ? "bg-gradient-to-br from-indigo-500/20 to-rose-500/20" 
            : "bg-white/[0.05]"
        )}>
          <FileText className="h-4 w-4 text-white/80" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
            {data.label}
          </h3>
          {data.authors && (
            <p className="text-white/40 text-xs flex items-center gap-1 mb-1">
              <User className="h-3 w-3" />
              {data.authors}
            </p>
          )}
          {data.year && (
            <p className="text-white/40 text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {data.year}
            </p>
          )}
          {data.citations && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                {data.citations} citations
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 400, y: 200 },
    data: { 
      label: 'Attention Is All You Need',
      authors: 'Vaswani et al.',
      year: '2017',
      citations: '50k+',
      type: 'main'
    },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: { 
      label: 'BERT: Pre-training of Deep Bidirectional Transformers',
      authors: 'Devlin et al.',
      year: '2018',
      citations: '35k+'
    },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 700, y: 100 },
    data: { 
      label: 'GPT-3: Language Models are Few-Shot Learners',
      authors: 'Brown et al.',
      year: '2020',
      citations: '30k+'
    },
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 100, y: 300 },
    data: { 
      label: 'RoBERTa: A Robustly Optimized BERT',
      authors: 'Liu et al.',
      year: '2019',
      citations: '15k+'
    },
  },
  {
    id: '5',
    type: 'custom',
    position: { x: 700, y: 300 },
    data: { 
      label: 'T5: Text-to-Text Transfer Transformer',
      authors: 'Raffel et al.',
      year: '2019',
      citations: '20k+'
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
  { 
    id: 'e1-5', 
    source: '1', 
    target: '5',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
];

export default function KnowledgeCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
    }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#030303] relative">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 right-0 z-10 p-6"
      >
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-lg">
                <Network className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Knowledge Canvas</h1>
            </div>
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
              <input
                type="text"
                placeholder="Search papers in canvas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className={cn(
                  "w-full pl-10 pr-4 py-2 rounded-lg",
                  "bg-white/[0.05] backdrop-blur-sm border border-white/[0.1]",
                  "text-white placeholder:text-white/40 text-sm",
                  "focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.2]",
                  "transition-all duration-300"
                )}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button className={cn(
              "p-2 rounded-lg",
              "bg-white/[0.05] hover:bg-white/[0.08]",
              "border border-white/[0.1] hover:border-white/[0.2]",
              "text-white/60 hover:text-white",
              "transition-all duration-300"
            )}>
              <Download className="h-4 w-4" />
            </button>
            <button className={cn(
              "p-2 rounded-lg",
              "bg-white/[0.05] hover:bg-white/[0.08]",
              "border border-white/[0.1] hover:border-white/[0.2]",
              "text-white/60 hover:text-white",
              "transition-all duration-300"
            )}>
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ReactFlow Canvas */}
      <div className="h-screen w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#030303]"
        >
          <Background 
            color="#ffffff10" 
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
          />
          <Controls 
            className="!bg-white/[0.05] !border-white/[0.1] !shadow-xl"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
        </ReactFlow>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute right-0 top-20 bottom-0 w-96 p-6 bg-white/[0.03] backdrop-blur-md border-l border-white/[0.1]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Paper Details</h2>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-white/40 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">{selectedNode.data.label}</h3>
              <p className="text-white/60 text-sm">{selectedNode.data.authors}</p>
              <p className="text-white/60 text-sm">{selectedNode.data.year}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">
                {selectedNode.data.citations} citations
              </span>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs">
                Deep Learning
              </span>
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs">
                NLP
              </span>
            </div>
            
            <div className="pt-4 space-y-3">
              <button className={cn(
                "w-full px-4 py-2 rounded-lg font-medium text-sm",
                "bg-gradient-to-r from-indigo-500 to-rose-500",
                "text-white shadow-lg shadow-indigo-500/25",
                "hover:shadow-xl hover:shadow-indigo-500/30",
                "transition-all duration-300"
              )}>
                Chat with Paper Agent
              </button>
              <button className={cn(
                "w-full px-4 py-2 rounded-lg font-medium text-sm",
                "bg-white/[0.05] hover:bg-white/[0.08]",
                "border border-white/[0.1] hover:border-white/[0.2]",
                "text-white transition-all duration-300"
              )}>
                View Full Paper
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Overlay */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute bottom-6 left-6 bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-lg p-4"
      >
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            <span className="text-white/60">{nodes.length} Papers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400"></div>
            <span className="text-white/60">{edges.length} Connections</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 