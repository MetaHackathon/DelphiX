import { useState, useRef, useEffect, useCallback } from "react";
import type { PdfHighlighterUtils } from "react-pdf-highlighter-extended";
import type { Highlight, ExtendedHighlight } from "./pdf-viewer-types";
import { Button } from "~/components/ui/button";
import { MessageCircle, Edit3, Trash2 } from "lucide-react";
import "./pdf-viewer.css";

// Dynamically import PDF components
const loadPdfComponents = () => import("react-pdf-highlighter-extended");

interface PdfViewerProps {
  document: {
    id: string;
    title: string;
    authors: string[];
    pdfUrl: string;
  };
  highlights: ExtendedHighlight[];
  zoom: number;
  tool: 'select' | 'text' | 'area';
  onAddHighlight: (highlight: Highlight) => Promise<void>;
  onUpdateHighlight: (highlightId: string, highlight: Partial<ExtendedHighlight>) => Promise<void>;
  onDeleteHighlight: (highlightId: string) => Promise<void>;
  onAddToContext: (highlightId: string) => void;
  highlighterUtilsRef: React.MutableRefObject<PdfHighlighterUtils | undefined>;
  onHighlightClick?: (highlight: ExtendedHighlight) => void;
}

export function PdfViewer({
  document,
  highlights,
  zoom,
  tool,
  onAddHighlight,
  onUpdateHighlight,
  onDeleteHighlight,
  onAddToContext,
  highlighterUtilsRef,
  onHighlightClick,
}: PdfViewerProps) {
  const [Components, setComponents] = useState<any>(null);

  useEffect(() => {
    loadPdfComponents().then(setComponents);
  }, []);

  if (!Components) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-gray-400">Loading PDF viewer...</div>
      </div>
    );
  }

  const {
    PdfLoader,
    PdfHighlighter,
    TextHighlight,
    AreaHighlight,
    MonitoredHighlightContainer,
    useHighlightContainerContext,
  } = Components;

  // Highlight container component
  const HighlightContainer = () => {
    const { highlight, isScrolledTo } = useHighlightContainerContext();
    const isTextHighlight = !Boolean(highlight.content?.image);

    const highlightTip = {
      position: highlight.position,
      content: (
        <div className="bg-[#1e1e1e]/95 backdrop-blur-sm border border-[#2d2d2d] rounded-lg shadow-2xl px-1 py-1 flex items-center gap-1">
            <Button
            size="sm"
            variant="ghost"
            onClick={() => onHighlightClick?.(highlight)}
            className="h-7 px-3 bg-transparent hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border-none rounded-md transition-all"
          >
            <Edit3 className="h-3 w-3 mr-1.5" />
            Add Note
            <span className="ml-2 text-[10px] text-white/50">⌘K</span>
          </Button>
          
          <Button
            size="sm"
            onClick={() => onAddToContext(highlight.id)}
            className="h-7 px-3 bg-transparent hover:bg-[#43c2ff]/20 text-[#43c2ff] text-xs font-medium border-none rounded-md transition-all"
          >
            <MessageCircle className="h-3 w-3 mr-1.5" />
            Add to Chat
            <span className="ml-2 text-[10px] text-white/50">⌘L</span>
          </Button>

          <div className="w-px h-4 bg-white/20 mx-1" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDeleteHighlight(highlight.id)}
            className="h-7 px-2 bg-transparent hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs border-none rounded-md transition-all"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )
    };

    const component = isTextHighlight ? (
      <TextHighlight 
        isScrolledTo={isScrolledTo} 
        highlight={highlight}
        onClick={() => {
          // Open sidebar to the thread/context where this highlight is referenced
          onHighlightClick?.(highlight);
        }}
      />
    ) : (
      <AreaHighlight 
        isScrolledTo={isScrolledTo} 
        highlight={highlight}
        onClick={() => {
          // Open sidebar to the thread/context where this highlight is referenced
          onHighlightClick?.(highlight);
        }}
      />
    );

    return (
      <MonitoredHighlightContainer
        key={highlight.id}
        highlightTip={highlightTip}
      >
        {component}
      </MonitoredHighlightContainer>
    );
  };

  return (
    <PdfLoader
      document={document.pdfUrl}
      beforeLoad={() => (
        <div className="flex items-center justify-center h-full">
          <div className="text-white/70">Loading document...</div>
        </div>
      )}
    >
      {(pdfDocument: any) => (
        <PdfHighlighter
          pdfDocument={pdfDocument}
          enableAreaSelection={(event: MouseEvent) => event.altKey}
          highlights={highlights}
          onScrollAway={() => {}}
          onSelection={(selection: any) => {
            // Create highlight immediately on selection
            if (selection) {
              const ghostHighlight = selection.makeGhostHighlight();
              if (ghostHighlight) {
                const newHighlight: Highlight = {
                  ...ghostHighlight,
                  id: Math.random().toString(36).substr(2, 9),
                  type: tool === 'area' ? 'area' : 'text',
                };
                onAddHighlight(newHighlight);
              }
            }
          }}
          pdfScaleValue={zoom}
          utilsRef={(utils: PdfHighlighterUtils) => {
            highlighterUtilsRef.current = utils;
          }}
          style={{
            background: "#121212"
          }}
        >
          <HighlightContainer />
        </PdfHighlighter>
      )}
    </PdfLoader>
  );
} 