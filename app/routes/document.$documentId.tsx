import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ClientOnly } from "~/components/client-only";
import { 
  ArrowLeft, 
  Send, 
  Download, 
  Share2, 
  Bookmark, 
  RotateCcw, 
  Settings,
  MessageCircle,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Move,
  Highlighter as HighlighterIcon,
  Type,
  Square,
  Circle,
  Minus,
  Plus,
  SidebarOpen,
  SidebarClose,
  MoreVertical,
  Copy,
  Trash2,
  Edit3,
  Save,
  X,
  Mic,
  MicOff,
  Phone,
  PhoneOff
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import React from "react";
import { PdfViewerWrapper } from "~/components/pdf-viewer-wrapper";
import type { Highlight, ExtendedHighlight, HighlightType } from "~/components/pdf-viewer-types";
import { Conversation } from '@elevenlabs/client';

// PDF Highlighter imports - using extended library with better TypeScript support
// Moved to dynamic imports in the component to avoid SSR issues

import { apiClient } from "~/lib/api";

export const meta: MetaFunction = () => {
  return [
    { title: "Document Viewer - DataEngineX" },
    { name: "description", content: "Advanced PDF viewer with highlighting and AI chat" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const documentId = params.documentId;
  
  try {
    // Get document data from API
    const document = await apiClient.getDocument(documentId!) as any;
    const annotationsResponse = await apiClient.getDocumentAnnotations(documentId!) as any;
    
    return json({ 
      document: {
        ...(document || {}),
        id: documentId,
        title: document?.title || "Untitled Document",
        authors: document?.authors || [],
        // Use the mounted /files endpoint from the FastAPI server
        pdfUrl: `http://localhost:8000/files/${documentId}.pdf`
      }, 
      annotations: annotationsResponse?.annotations || [],
      highlights: annotationsResponse?.highlights || []
    });
  } catch (error) {
    console.error('Error loading document:', error);
    throw new Response("Document not found", { status: 404 });
  }
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
  highlights?: string[];
}

interface AnnotationItem {
  id: string;
  type: 'highlight' | 'note' | 'bookmark';
  content: string;
  page: number;
  timestamp: Date;
  color?: string;
  highlight_text?: string;
}

const EXAMPLE_PROMPTS = [
  "Explain this in simpler terms",
  "What are the key points?",
  "How does this relate to other concepts?",
  "Give me an example"
];

export default function DocumentViewer() {
  const { document, annotations: initialAnnotations, highlights: initialHighlights } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  
  // Configure PDF.js worker on client side only
  useEffect(() => {
    const configurePdfWorker = async () => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        try {
          const pdfjs = await import('pdfjs-dist');
          // Use the correct version that matches our installed package
          pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;
        } catch (error) {
          console.warn('PDF.js worker configuration failed:', error);
        }
      }
    };
    
    configurePdfWorker();
  }, []);
  
  // PDF Viewer State
  const [highlights, setHighlights] = useState<ExtendedHighlight[]>(initialHighlights || []);
  const [zoom, setZoom] = useState<number>(1.0);
  const [tool, setTool] = useState<'select' | 'text' | 'area'>('select');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'annotations'>('annotations');
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `I'm your AI research assistant for "${document.title}". I can help you understand the content, answer questions, and work with your highlights and annotations.`,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  
  // Annotations State
  const [annotations, setAnnotations] = useState<AnnotationItem[]>(initialAnnotations || []);
  const [contextHighlights, setContextHighlights] = useState<string[]>([]);
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);
  const [annotationContent, setAnnotationContent] = useState("");

  // ElevenLabs Conversational AI State
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'connecting'>('disconnected');
  const [agentStatus, setAgentStatus] = useState<'listening' | 'speaking'>('listening');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Zoom functionality with native-like behavior
  const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  
  const handleZoomIn = useCallback(() => {
    const currentIndex = zoomLevels.findIndex(level => level >= zoom);
    if (currentIndex < zoomLevels.length - 1) {
      const newZoom = zoomLevels[currentIndex + 1];
      setZoom(newZoom);
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    const currentIndex = zoomLevels.findIndex(level => level >= zoom);
    if (currentIndex > 0) {
      const newZoom = zoomLevels[currentIndex - 1];
      setZoom(newZoom);
    }
  }, [zoom]);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          setZoom(1.0);
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleZoomIn, handleZoomOut]);

  // Handle highlight creation
  const addHighlight = useCallback(async (highlight: Highlight) => {
    const newHighlight: ExtendedHighlight = {
      ...highlight,
      id: Math.random().toString(36).substr(2, 9),
      color: getToolColor(tool),
      type: tool === 'select' ? 'text' : (tool as HighlightType),
      timestamp: new Date()
    };
    
    setHighlights(prev => [...prev, newHighlight]);
    
    // Save to backend
    try {
      await apiClient.saveHighlight(document.id, {
        content: newHighlight.content || { text: '', image: '' },
        position: newHighlight.position,
        color: newHighlight.color,
        type: newHighlight.type
      });
    } catch (error) {
      console.error('Failed to save highlight:', error);
    }
  }, [tool, document.id]);

  // Handle highlight update
  const updateHighlight = useCallback(async (highlightId: string, highlight: Partial<ExtendedHighlight>) => {
    setHighlights(prev => 
      prev.map(h => h.id === highlightId ? { ...h, ...highlight } : h)
    );
    
    try {
      await apiClient.updateHighlight(document.id, highlightId, {
        comment: highlight.comment,
        color: highlight.color
      });
    } catch (error) {
      console.error('Failed to update highlight:', error);
    }
  }, [document.id]);

  // Handle highlight deletion
  const deleteHighlight = useCallback(async (highlightId: string) => {
    setHighlights(prev => prev.filter(h => h.id !== highlightId));
    setAnnotations(prev => prev.filter(a => a.id !== highlightId));
    
    try {
      await apiClient.deleteHighlight(document.id, highlightId);
    } catch (error) {
      console.error('Failed to delete highlight:', error);
    }
  }, [document.id]);

  // Save annotation
  const handleSaveAnnotation = async () => {
    if (!annotationContent.trim()) return;

    const selectedHighlightData = selectedHighlight ? 
      highlights.find(h => h.id === selectedHighlight) : null;

    const annotation: AnnotationItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'note',
      content: annotationContent,
      page: currentPage,
      timestamp: new Date(),
      highlight_text: selectedHighlightData?.content?.text
    };

    setAnnotations(prev => [...prev, annotation]);
    setAnnotationContent("");
    setSelectedHighlight(null);

    try {
      await apiClient.saveAnnotation(document.id, {
        type: 'note',
        content: annotationContent,
        page: currentPage,
        position: selectedHighlightData?.position
      });
    } catch (error) {
      console.error('Failed to save annotation:', error);
    }
  };

  // Chat functionality
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Append markdown instruction to the prompt
    const messageWithFormat = `${inputValue}\n\nPlease format your response in markdown.`;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      context: contextHighlights.length > 0 ? `Referenced highlights: ${contextHighlights.join(', ')}` : undefined,
      highlights: [...contextHighlights]
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowPrompts(false);

    try {
      const response = await apiClient.sendDocumentChatMessage(document.id, messageWithFormat, {
        highlights: contextHighlights
      }) as { message?: string };

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.message || `I understand you're asking about "${inputValue}". Based on the document content${contextHighlights.length > 0 ? ' and your highlighted sections' : ''}, here's my analysis:\n\n`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send chat message:', error);
      
      // Fallback response in markdown format
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you're asking about "${inputValue}". Based on the document content${contextHighlights.length > 0 ? ' and your highlighted sections' : ''}, here's my analysis:\n\n- Point 1\n- Point 2\n- Point 3`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const addHighlightToContext = useCallback((highlightId: string) => {
    setContextHighlights(prev => 
      prev.includes(highlightId) ? prev : [...prev, highlightId]
    );
    setSidebarTab('chat');
  }, []);

  const removeHighlightFromContext = useCallback((highlightId: string) => {
    setContextHighlights(prev => prev.filter(id => id !== highlightId));
  }, []);

  const clearHighlight = useCallback(() => {
    setSelectedHighlight(null);
  }, []);

  // Handle highlight click - open sidebar to relevant context like Cursor
  const handleHighlightClick = useCallback((highlight: ExtendedHighlight) => {
    // Check if highlight is already in chat context
    if (contextHighlights.includes(highlight.id)) {
      // Open to chat tab to show the context
      setSidebarTab('chat');
      setSidebarOpen(true);
    } else {
      // Check if highlight has annotations
      const hasAnnotation = annotations.some(ann => ann.highlight_text === highlight.content?.text);
      if (hasAnnotation) {
        // Open to annotations tab
        setSidebarTab('annotations');
        setSidebarOpen(true);
      } else {
        // No existing context, open to annotations for quick note adding
        setSelectedHighlight(highlight.id);
        setSidebarTab('annotations');
        setSidebarOpen(true);
      }
    }
  }, [contextHighlights, annotations]);

  // Utility functions
  const getToolColor = (tool: string) => {
    switch (tool) {
      case 'text': return '#FFFF00';
      case 'area': return '#FF6B6B';
      default: return '#FFFF00';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    setShowPrompts(false);
  };

  const highlighterUtilsRef = useRef<any>();

  const startConversation = async () => {
    setConnectionStatus('connecting');
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const conv = await Conversation.startSession({
        agentId: 'agent_01jxe41sqpe0br7385z6dage63',
        onConnect: () => {
          setConnectionStatus('connected');
        },
        onDisconnect: () => {
          setConnectionStatus('disconnected');
        },
        onError: (error) => {
          console.error('Error:', error);
          setConnectionStatus('disconnected');
        },
        onModeChange: (mode) => {
          setAgentStatus(mode.mode === 'speaking' ? 'speaking' : 'listening');
        },
      });
      setConversation(conv);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setConnectionStatus('disconnected');
    }
  };

  const stopConversation = async () => {
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] pt-20">
      {/* Top Bar - Document Controls */}
      <div className="sticky top-20 left-0 right-0 h-12 z-10 flex items-center justify-between px-4 bg-[#121212]/95 backdrop-blur-sm border-b border-[#1a1f2e]/30">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 px-3"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-5 bg-white/10" />
          <div>
            <h1 className="text-sm font-medium text-white/90 leading-tight">{document.title}</h1>
            <p className="text-xs text-white/50">{document.authors.join(', ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Page Info */}
          <div className="text-xs text-white/70 font-medium">
            Page {currentPage} / {totalPages}
          </div>

          <Separator orientation="vertical" className="h-5 bg-white/10" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomOut} 
              disabled={zoom <= zoomLevels[0]} 
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <div className="text-xs font-medium text-white/70 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomIn} 
              disabled={zoom >= zoomLevels[zoomLevels.length - 1]} 
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-5 bg-white/10" />

          {/* Tool Selection */}
          <div className="flex items-center gap-1">
            <Button 
              variant={tool === 'select' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setTool('select')}
              className={tool === 'select' ? 
                'bg-blue-600 text-white h-8 w-8 p-0' : 
                'text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0'
              }
            >
              <Move className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant={tool === 'text' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setTool('text')}
              className={tool === 'text' ? 
                'bg-blue-600 text-white h-8 w-8 p-0' : 
                'text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0'
              }
            >
              <Type className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant={tool === 'area' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setTool('area')}
              className={tool === 'area' ? 
                'bg-blue-600 text-white h-8 w-8 p-0' : 
                'text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0'
              }
            >
              <Square className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-5 bg-white/10" />

          {/* ElevenLabs Conversational AI Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-white/70">
              {connectionStatus === 'connected' && agentStatus === 'listening' && (
                <div className="flex items-center gap-1.5 text-green-400">
                  <Mic className="h-3 w-3 animate-pulse" />
                  Listening
                </div>
              )}
              {connectionStatus === 'connected' && agentStatus === 'speaking' && (
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Phone className="h-3 w-3" />
                  Speaking
                </div>
              )}
              {connectionStatus === 'connecting' && (
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <span className="inline-block w-2 h-2 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                  Connecting...
                </div>
              )}
              {connectionStatus === 'disconnected' && (
                <div className="flex items-center gap-1.5 text-red-400">
                  <MicOff className="h-3 w-3" />
                  Disconnected
                </div>
              )}
            </div>
            {connectionStatus !== 'connected' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={startConversation}
                disabled={connectionStatus === 'connecting'}
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 px-3"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                Start Call
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={stopConversation}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-3"
              >
                <PhoneOff className="w-3.5 h-3.5 mr-1.5" />
                End Call
              </Button>
            )}
          </div>

          <Separator orientation="vertical" className="h-5 bg-white/10" />

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
          >
            {sidebarOpen ? <SidebarClose className="w-3.5 h-3.5" /> : <SidebarOpen className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex" style={{ height: 'calc(100vh - 128px)' }}>
        {/* PDF Viewer */}
        <div className="flex-1 relative bg-[#121212] overflow-hidden">
          <ClientOnly fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-white/70">Loading PDF viewer...</div>
            </div>
          }>
            <PdfViewerWrapper
              document={document}
              highlights={highlights}
              zoom={zoom}
              tool={tool}
              onAddHighlight={addHighlight}
              onUpdateHighlight={updateHighlight}
              onDeleteHighlight={deleteHighlight}
              onAddToContext={addHighlightToContext}
              highlighterUtilsRef={highlighterUtilsRef}
              onHighlightClick={handleHighlightClick}
            />
          </ClientOnly>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-[#121212]/95 backdrop-blur-md flex flex-col border-l border-[#1a1f2e]/50 h-[calc(100vh-128px)]">
            <ClientOnly fallback={<div className="p-4 text-center text-gray-400">Loading sidebar...</div>}>
              {/* Sidebar Header */}
              <div className="flex-none flex items-center justify-between px-3 py-2 border-b border-[#1a1f2e]/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white/90">Research Assistant</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 hover:bg-white/10 rounded-full"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-3 w-3 text-white/70" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex-none h-8 flex items-center px-3 py-1 bg-transparent border-b border-[#1a1f2e]/50">
                <button
                  onClick={() => setSidebarTab('annotations')}
                  className={`flex-1 h-6 text-xs font-medium rounded-sm transition-all ${
                    sidebarTab === 'annotations' 
                      ? 'bg-[#1a1f2e]/30 text-white' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Annotations
                </button>
                <button
                  onClick={() => setSidebarTab('chat')}
                  className={`flex-1 h-6 text-xs font-medium rounded-sm transition-all ${
                    sidebarTab === 'chat' 
                      ? 'bg-[#1a1f2e]/30 text-white' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Chat
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {sidebarTab === 'annotations' ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Annotations List */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1a1f2e] scrollbar-track-transparent">
                      <div className="p-3 space-y-2">
                        {annotations.map((annotation) => (
                          <div 
                            key={annotation.id} 
                            className="group bg-[#1a1f2e]/30 rounded-md p-2.5 border border-[#1a1f2e]/30 hover:border-[#2a2f3e]/30 transition-colors"
                          >
                            {annotation.highlight_text && (
                              <div className="mb-2 p-2 bg-[#1a1f2e]/20 border-l-2 border-[#43c2ff]/30 rounded-sm">
                                <p className="text-xs text-white/70 leading-relaxed">{annotation.highlight_text}</p>
                              </div>
                            )}
                            <p className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap">{annotation.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-[10px] text-white/50">
                                {new Date(annotation.timestamp).toLocaleString()}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (annotation.id) {
                                    addHighlightToContext(annotation.id);
                                  }
                                }}
                                className="h-5 px-2 text-[10px] text-[#43c2ff]/90 hover:text-[#43c2ff] hover:bg-[#43c2ff]/10 rounded-sm"
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Chat
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Annotation */}
                    <div className="flex-none p-3 border-t border-[#1a1f2e]/50 bg-[#121212]/95">
                      {selectedHighlight && (
                        <div className="mb-2 p-2 bg-[#1a1f2e]/20 border-l-2 border-[#43c2ff]/30 rounded-sm relative group">
                          <p className="text-xs text-white/70 leading-relaxed pr-6">
                            {highlights.find(h => h.id === selectedHighlight)?.content?.text || 'Selected highlight'}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearHighlight}
                            className="absolute top-1 right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full"
                          >
                            <X className="h-3 w-3 text-white/50" />
                          </Button>
                        </div>
                      )}
                      <div className="relative">
                        <Textarea
                          value={annotationContent}
                          onChange={(e) => setAnnotationContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveAnnotation();
                            }
                          }}
                          placeholder="Add your thoughts..."
                          className="min-h-[80px] max-h-[120px] bg-[#1a1f2e]/20 border border-[#1a1f2e]/30 rounded-md text-xs text-white resize-none pr-12 placeholder:text-white/40 focus:border-[#43c2ff]/30 focus:bg-[#1a1f2e]/40"
                        />
                        <Button 
                          onClick={handleSaveAnnotation}
                          disabled={!annotationContent.trim()}
                          className="absolute bottom-2 right-2 h-6 px-2 bg-[#43c2ff]/90 hover:bg-[#43c2ff] text-[10px] font-medium text-white rounded-sm"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Chat Interface
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1a1f2e] scrollbar-track-transparent">
                      {/* Context Highlights */}
                      {contextHighlights.length > 0 && (
                        <div className="p-2 bg-[#1a1f2e]/20 border-l-2 border-[#43c2ff]/30 rounded-sm">
                          <p className="text-[10px] text-[#43c2ff]/90 font-medium mb-1">Chat Context:</p>
                          {contextHighlights.map(id => {
                            const highlight = highlights.find(h => h.id === id);
                            return highlight ? (
                              <div key={id} className="flex items-center justify-between text-[10px] py-1">
                                <span className="text-white/70 truncate">{highlight.content?.text?.slice(0, 50)}...</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeHighlightFromContext(id)}
                                  className="h-4 w-4 p-0 text-white/50 hover:text-white hover:bg-white/10 rounded-full ml-2"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* Example Prompts */}
                      {messages.length === 1 && showPrompts && (
                        <div className="space-y-2 py-2">
                          <div className="text-center">
                            <Sparkles className="h-5 w-5 mx-auto mb-2 text-[#43c2ff]/70" />
                            <h3 className="text-xs font-medium text-white/90 mb-1">Research Assistant</h3>
                            <p className="text-[10px] text-white/60">Ask me anything about the paper</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {EXAMPLE_PROMPTS.map((prompt, index) => (
                              <button
                                key={index}
                                onClick={() => handlePromptClick(prompt)}
                                className="p-2 text-[10px] bg-[#1a1f2e]/30 hover:bg-[#1a1f2e]/50 rounded-md text-white/70 transition-colors border border-[#1a1f2e]/30 hover:border-[#1a1f2e]/50 text-left"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Messages */}
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] ${message.type === 'user' ? 'ml-4' : 'mr-4'}`}>
                            {message.type === 'assistant' && (
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 bg-[#43c2ff]/10 rounded-full flex items-center justify-center">
                                  <span className="text-[10px] text-[#43c2ff]">AI</span>
                                </div>
                                <span className="text-[10px] font-medium text-white/70">Assistant</span>
                              </div>
                            )}
                            
                            <div className={`rounded-lg p-3 ${
                              message.type === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-[#1a1f2e]/30 text-white/90'
                            }`}>
                              <div className="text-xs leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                                {message.content}
                              </div>
                              
                              {message.context && (
                                <div className="mt-2 pt-2 border-t border-white/10">
                                  <p className="text-[10px] text-white/60">{message.context}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mt-1`}>
                              <span className="text-[10px] text-white/40">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-[#1a1f2e]/30 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-[10px] text-white/50">Analyzing...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="flex-none p-3 border-t border-[#1a1f2e]/50 bg-[#121212]/95">
                      <div className="relative bg-[#1a1f2e]/20 rounded-md border border-[#1a1f2e]/30 focus-within:border-[#43c2ff]/30 focus-within:bg-[#1a1f2e]/40 transition-all">
                        <Textarea
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Send a message..."
                          rows={2}
                          className="min-h-[60px] max-h-[120px] bg-transparent border-none text-xs resize-none pr-10 py-2.5 px-3 placeholder:text-white/40 focus:ring-0 focus:outline-none text-white"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isLoading}
                          className="absolute bottom-2 right-2 h-6 px-2 bg-[#43c2ff]/90 hover:bg-[#43c2ff] text-[10px] font-medium text-white rounded-sm"
                        >
                          {isLoading ? (
                            <span className="inline-block w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              Send
                              <Send className="h-3 w-3 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ClientOnly>
          </div>
        )}
      </div>
    </div>
  );
} 