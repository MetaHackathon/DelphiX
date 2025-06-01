export type Highlight = {
  id: string;
  position: {
    boundingRect: any;
    rects: any[];
    pageNumber?: number;
  };
  content?: {
    text?: string;
    image?: string;
  };
  type: 'text' | 'area';
};

export type ExtendedHighlight = Highlight & {
  color?: string;
  comment?: string;
  timestamp?: Date;
};

export type ViewportHighlight = any;
export type Content = any;
export type HighlightType = 'text' | 'area'; 