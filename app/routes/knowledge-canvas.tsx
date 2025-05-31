import type { MetaFunction } from "@remix-run/node";
import { useState, useCallback } from "react";
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
} from 'reactflow';
import 'reactflow/dist/style.css';

import { ArrowLeft, Search, Plus, Eye, MessageCircle, Network, Download, Settings, Sparkles, FileText, Users, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => {
  return [
    { title: "Knowledge Canvas - DataEngineX" },
    { name: "description", content: "Visualize and explore connections between research papers" },
  ];
};

// Custom Paper Node Component
const PaperNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <Card className={`w-64 transition-all duration-200 ${
      selected 
        ? 'ring-2 ring-blue-500 shadow-lg' 
        : 'hover:shadow-md border-gray-200'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-start space-x-2">
          <div className={`w-3 h-3 rounded-full mt-1 ${data.color}`} />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
              {data.title}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {data.authors.join(', ')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1">
          {data.topics.slice(0, 2).map((topic: string) => (
            <Badge key={topic} variant="secondary" className="text-xs px-1 py-0">
              {topic}
            </Badge>
          ))}
          {data.topics.length > 2 && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              +{data.topics.length - 2}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{data.year}</span>
          <span>{data.citations?.toLocaleString()} citations</span>
        </div>
      </CardContent>
    </Card>
  );
};

const nodeTypes = {
  paperNode: PaperNode,
};

const initialNodes: Node[] = [
  {
    id: 'attention',
    type: 'paperNode',
    position: { x: 400, y: 200 },
    data: {
      title: 'Attention Is All You Need',
      authors: ['Vaswani et al.'],
      topics: ['transformers', 'attention', 'nlp'],
      year: 2017,
      citations: 50000,
      color: 'bg-blue-500',
    },
  },
  {
    id: 'bert',
    type: 'paperNode',
    position: { x: 100, y: 100 },
    data: {
      title: 'BERT: Pre-training of Deep Bidirectional Transformers',
      authors: ['Devlin et al.'],
      topics: ['bert', 'pretraining', 'nlp'],
      year: 2018,
      citations: 35000,
      color: 'bg-green-500',
    },
  },
  {
    id: 'gpt',
    type: 'paperNode',
    position: { x: 700, y: 100 },
    data: {
      title: 'Language Models are Unsupervised Multitask Learners',
      authors: ['Radford et al.'],
      topics: ['gpt', 'language models', 'generation'],
      year: 2019,
      citations: 25000,
      color: 'bg-amber-500',
    },
  },
  {
    id: 'roberta',
    type: 'paperNode',
    position: { x: 50, y: 350 },
    data: {
      title: 'RoBERTa: A Robustly Optimized BERT Pretraining Approach',
      authors: ['Liu et al.'],
      topics: ['roberta', 'optimization', 'nlp'],
      year: 2019,
      citations: 15000,
      color: 'bg-purple-500',
    },
  },
  {
    id: 'gpt3',
    type: 'paperNode',
    position: { x: 750, y: 350 },
    data: {
      title: 'Language Models are Few-Shot Learners',
      authors: ['Brown et al.'],
      topics: ['gpt-3', 'few-shot', 'scale'],
      year: 2020,
      citations: 30000,
      color: 'bg-red-500',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'attention', target: 'bert', type: 'smoothstep', animated: true },
  { id: 'e1-3', source: 'attention', target: 'gpt', type: 'smoothstep', animated: true },
  { id: 'e2-4', source: 'bert', target: 'roberta', type: 'smoothstep' },
  { id: 'e3-5', source: 'gpt', target: 'gpt3', type: 'smoothstep' },
];

export default function KnowledgeCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Network className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Knowledge Canvas</h1>
                <p className="text-xs text-gray-500">Research Paper Network</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Papers
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Canvas */}
        <div className="flex-1 relative">
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
            attributionPosition="bottom-left"
            className="bg-white"
          >
            <Background color="#f1f5f9" gap={20} />
            <Controls 
              position="bottom-right"
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
            />
            <MiniMap 
              position="bottom-left"
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
              maskColor="rgb(240, 242, 247, 0.8)"
            />
            
            {/* Stats Panel */}
            <Panel position="top-left" className="m-4">
              <Card className="w-64">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Network Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">Papers</span>
                    </div>
                    <span className="font-medium">{nodes.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Network className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">Connections</span>
                    </div>
                    <span className="font-medium">{edges.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-gray-600">Status</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Panel>
          </ReactFlow>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-gray-200 bg-white">
          {selectedNode ? (
            <div className="p-6">
              <div className="space-y-6">
                {/* Paper Details */}
                <div>
                  <div className="flex items-start space-x-3 mb-4">
                    <div className={`w-4 h-4 rounded-full mt-1 ${selectedNode.data.color}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {selectedNode.data.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedNode.data.authors.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedNode.data.topics.map((topic: string) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Year</span>
                      <p className="font-medium">{selectedNode.data.year}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Citations</span>
                      <p className="font-medium">{selectedNode.data.citations?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-3">
                  <Link to={`/paper/${selectedNode.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Eye className="w-4 h-4 mr-2" />
                      Open Paper Agent
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ask Questions
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>

                <Separator />

                {/* Connected Papers */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Connected Papers</h4>
                  <div className="space-y-2">
                    {edges
                      .filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
                      .map(edge => {
                        const connectedNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                        const connectedNode = nodes.find(n => n.id === connectedNodeId);
                        return connectedNode ? (
                          <Card key={connectedNode.id} className="p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-2">
                              <div className={`w-2 h-2 rounded-full mt-2 ${connectedNode.data.color}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 leading-tight">
                                  {connectedNode.data.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {connectedNode.data.authors.join(', ')}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ) : null;
                      })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Network className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Paper</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Click on any paper node to explore its details, connections, and interact with it using AI.
              </p>
              
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Import Papers
                </Button>
                <Button variant="outline" className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Search ArXiv
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="text-left space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Zap className="w-4 h-4 mr-2" />
                    Auto-arrange layout
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Cluster by topic
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export network
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 