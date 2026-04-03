export interface BorderStyle {
  width: number;
  color: string;
  radius: number;
}

export interface BlockStyle {
  backgroundColor: string;
  border: BorderStyle;
  shadow: string;
  opacity: number;
  padding: string; // Added to fix your TS error
  fontSize?: number;
  fontWeight?: string;
}

export interface EmailBlock {
  id: string;
  type: string;
  content: {
    value?: string;
    url?: string;
    alt?: string;
    href?: string;
  };
  layout: {
    colStart: number;
    colSpan: number;
    rowStart: number;
    rowSpan: number;
  };
  style: BlockStyle;
}

// This is the "Canvas" version of styles
export interface CanvasStyle {
  backgroundColor: string;
  opacity: number;
  border?: BorderStyle;
  shadow?: string;
}

export interface EmailState {
  blocks: EmailBlock[];
  selectedTarget: { type: 'block' | 'canvas'; id?: string } | null;
  canvasStyle: CanvasStyle;
  selectedBlockIds: string[];
  past: any[]; // Snapshot history
  future: any[];
}