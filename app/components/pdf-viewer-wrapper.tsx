import { useState, useEffect } from "react";
import type { ExtendedHighlight } from "./pdf-viewer-types";

interface PdfViewerWrapperProps {
  document: {
    id: string;
    title: string;
    authors: string[];
    pdfUrl: string;
  };
  highlights: ExtendedHighlight[];
  zoom: number;
  tool: 'select' | 'text' | 'area';
  onAddHighlight: (highlight: any) => Promise<void>;
  onUpdateHighlight: (highlightId: string, highlight: Partial<ExtendedHighlight>) => Promise<void>;
  onDeleteHighlight: (highlightId: string) => Promise<void>;
  onAddToContext: (highlightId: string) => void;
  highlighterUtilsRef: React.MutableRefObject<any>;
  onHighlightClick?: (highlight: ExtendedHighlight) => void;
}

export function PdfViewerWrapper(props: PdfViewerWrapperProps) {
  const [PdfViewerComponent, setPdfViewerComponent] = useState<React.ComponentType<PdfViewerWrapperProps> | null>(null);
  
  useEffect(() => {
    import('./pdf-viewer').then(module => {
      setPdfViewerComponent(() => module.PdfViewer);
    });
  }, []);
  
  if (!PdfViewerComponent) {
    return <div className="p-4 text-center text-gray-400">Loading PDF viewer...</div>;
  }
  
  return <PdfViewerComponent {...props} />;
} 