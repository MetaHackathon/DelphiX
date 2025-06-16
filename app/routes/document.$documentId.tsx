import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ClientOnly } from "~/components/client-only";
import { AuthGuard, useAuth } from "~/components/auth-guard";
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
  
  // Just return the document ID - we'll load data client-side with auth
  return json({ 
    documentId,
    // Pre-configure the PDF URL for faster loading
    pdfUrl: `http://localhost:8000/files/${documentId}.pdf`
  });
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
  const { documentId, pdfUrl } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  
  // Document state - loaded client-side
  const [document, setDocument] = useState<any>({
    id: documentId,
    title: "Loading...",
    authors: [],
    pdfUrl: pdfUrl
  });
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  
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
  
  // Load document data client-side
  useEffect(() => {
    const loadDocumentData = async () => {
      if (!user || !documentId) return;
      
      try {
        setLoading(true);
        
        // Load document data and annotations in parallel
        const [documentData, annotationsData] = await Promise.all([
          apiClient.getDocument(documentId) as Promise<any>,
          apiClient.getDocumentAnnotations(documentId) as Promise<any>
        ]);
        
        // Update document state
        setDocument({
          id: documentId,
          title: documentData?.title || "Untitled Document",
          authors: documentData?.authors || [],
          pdfUrl: pdfUrl
        });
        
        // Update annotations and highlights
        setAnnotations(annotationsData?.annotations || []);
        setHighlights(annotationsData?.highlights || []);
        
        // Initialize chat with document-specific message
        setMessages([
          {
            id: '1',
            type: 'assistant',
            content: `I'm your AI research assistant for "${documentData?.title || 'this document'}". I can help you understand the content, answer questions, and work with your highlights and annotations.`,
            timestamp: new Date(),
          }
        ]);
        
      } catch (error) {
        console.error('Error loading document:', error);
        setDocument({
          id: documentId,
          title: "Document not found",
          authors: [],
          pdfUrl: pdfUrl
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDocumentData();
  }, [user, documentId, pdfUrl]);
  
  // PDF Viewer State
  const [highlights, setHighlights] = useState<ExtendedHighlight[]>([]);
  const [zoom, setZoom] = useState<number>(1.0);
  const [tool, setTool] = useState<'select' | 'text' | 'area'>('select');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'annotations'>('annotations');
  const [sidebarWidth, setSidebarWidth] = useState(320); // Start with 320px instead of fixed 80 class
  const [isResizing, setIsResizing] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  
  // Annotations State
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
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
  const highlighterUtilsRef = useRef<any>();

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

  // Add resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = window.innerWidth - e.clientX;
    const minWidth = 280;
    const maxWidth = Math.min(600, window.innerWidth * 0.5);
    
    setSidebarWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isResizing) return;
    
    const handleMouseMoveWrapper = (e: MouseEvent) => handleMouseMove(e);
    const handleMouseUpWrapper = (e: MouseEvent) => handleMouseUp();
    
    window.addEventListener('mousemove', handleMouseMoveWrapper);
    window.addEventListener('mouseup', handleMouseUpWrapper);
    
    if (document?.body) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveWrapper);
      window.removeEventListener('mouseup', handleMouseUpWrapper);
      if (document?.body) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Show loading state while document loads
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/70 mb-4">Loading document...</div>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
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
          <div 
            className="relative bg-[#121212]/95 backdrop-blur-md flex flex-col border-l border-[#1a1f2e]/50 h-[calc(100vh-128px)]"
            style={{ width: sidebarWidth }}
          >
            {/* Resize Handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-white/20 transition-colors group z-10"
              onMouseDown={handleMouseDown}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 group-hover:bg-white/20 transition-colors" />
              <div className="absolute left-[-2px] top-0 bottom-0 w-1 invisible" /> {/* Wider hover area */}
            </div>
            
            <ClientOnly fallback={
              <div className="p-6 text-center text-gray-500">
                <div className="animate-pulse">Loading sidebar...</div>
              </div>
            }>
              {/* Sidebar Header */}
              <div className="flex-none px-3 py-2 border-b border-[#1a1f2e]/50 bg-[#121212]/80 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#1a1f2e]/50 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white/80" />
                    </div>
                    <span className="text-xs font-medium text-white/90">Research Assistant</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="h-5 w-5 p-0 hover:bg-white/10 rounded-full"
                  >
                    <X className="h-3 w-3 text-white/70" />
                  </Button>
                </div>
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

              {/* Content Area */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {sidebarTab === 'annotations' ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Annotations List */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1a1f2e] scrollbar-track-transparent">
                      <div className="p-3 space-y-2">
                        {annotations.length === 0 ? (
                          <div className="text-center py-8">
                            <Type className="w-6 h-6 mx-auto text-white/30 mb-3" />
                            <p className="text-xs text-white/50 mb-1">No annotations yet</p>
                            <p className="text-xs text-white/30">Highlight text to add notes</p>
                          </div>
                        ) : (
                          annotations.map((annotation) => (
                            <div 
                              key={annotation.id} 
                              className="group bg-[#1a1f2e]/30 rounded-md p-2.5 border border-[#1a1f2e]/30 hover:border-[#2a2f3e]/30 transition-colors"
                            >
                              {annotation.highlight_text && (
                                <div className="mb-2 p-2 bg-[#1a1f2e]/20 border-l-2 border-white/20 rounded-sm">
                                  <p className="text-xs text-white/70 leading-relaxed">"{annotation.highlight_text}"</p>
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
                                  className="h-5 px-2 text-[10px] text-white/70 hover:text-white hover:bg-white/10 rounded-sm"
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  Chat
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Add Annotation */}
                    <div className="flex-none p-3 border-t border-[#1a1f2e]/50 bg-[#121212]/95">
                      {selectedHighlight && (
                        <div className="mb-2 p-2 bg-[#1a1f2e]/20 border-l-2 border-white/20 rounded-sm relative group">
                          <p className="text-xs text-white/70 leading-relaxed pr-6">
                            "{highlights.find(h => h.id === selectedHighlight)?.content?.text || 'Selected highlight'}"
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
                          className="min-h-[80px] max-h-[120px] bg-[#1a1f2e]/20 border border-[#1a1f2e]/30 rounded-md text-xs text-white resize-none pr-12 placeholder:text-white/40 focus:border-white/30 focus:bg-[#1a1f2e]/40"
                        />
                        <Button 
                          onClick={handleSaveAnnotation}
                          disabled={!annotationContent.trim()}
                          className="absolute bottom-2 right-2 h-6 px-2 bg-white/90 hover:bg-white text-[10px] font-medium text-black rounded-sm"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Enhanced Chat Interface
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-4 space-y-4">
                        {/* Context Highlights */}
                        {contextHighlights.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">C</span>
                              </div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Chat Context</p>
                            </div>
                            {contextHighlights.map(id => {
                              const highlight = highlights.find(h => h.id === id);
                              return highlight ? (
                                <div key={id} className="flex items-start justify-between gap-3 py-2">
                                  <p className="text-sm text-blue-800 dark:text-blue-200 flex-1 leading-relaxed">
                                    "{highlight.content?.text?.slice(0, 80)}..."
                                  </p>
                                  <button
                                    onClick={() => removeHighlightFromContext(id)}
                                    className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors shadow-sm"
                                  >
                                    <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                  </button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}

                        {/* Welcome Message & Prompts */}
                        {messages.length <= 1 && (
                          <div className="space-y-4">
                            <div className="text-center py-6">
                              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                                <Sparkles className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                AI Research Assistant
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                I'm here to help you understand this paper. Ask me anything!
                              </p>
                            </div>
                            
                            {showPrompts && (
                              <div className="grid grid-cols-1 gap-2">
                                {EXAMPLE_PROMPTS.map((prompt, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handlePromptClick(prompt)}
                                    className="p-3 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-left group"
                                  >
                                    <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {prompt}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Messages */}
                        {messages.slice(1).map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                              {message.type === 'assistant' && (
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Assistant</span>
                                </div>
                              )}
                              
                              <div className={`rounded-2xl px-4 py-3 ${
                                message.type === 'user' 
                                  ? 'bg-blue-600 text-white ml-12' 
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                              }`}>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                                  {message.content}
                                </div>
                                
                                {message.context && (
                                  <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{message.context}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mt-2`}>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Enhanced Chat Input */}
                    <div className="flex-none p-4 border-t border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md">
                      <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-all shadow-sm">
                        <Textarea
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask me anything about this paper..."
                          rows={3}
                          className="min-h-[80px] max-h-[120px] bg-transparent border-none text-sm resize-none pr-12 py-4 px-4 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 focus:outline-none text-gray-900 dark:text-gray-100"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isLoading}
                          className="absolute bottom-3 right-3 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 rounded-xl flex items-center justify-center transition-colors disabled:cursor-not-allowed group"
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          )}
                        </button>
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
    </AuthGuard>
  );
} 