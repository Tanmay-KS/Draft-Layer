export interface BlockStyle {
  padding: string;
  backgroundColor: string;
  border: {
    width: number;
    color: string;
    radius: number;
  };
  shadow: string;
  opacity: number;
  //Typography
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

export interface EmailBlock {
  id: string;
  type: string;

  layout: {
    colStart: number;
    colSpan: number;
    rowStart: number;
    rowSpan: number;
  };

  style: BlockStyle;
  content: {
    value: string;
    url?: string;
    alt?: string;
    href?: string;
  };
}

export interface EmailState {
  blocks: EmailBlock[];
  selectedTarget: {
    type: 'block' | 'canvas';
    id?: string;
  } | null;
  canvasStyle: BlockStyle;
  past: Omit<EmailState, 'past' | 'future'>[];
  future: Omit<EmailState, 'past' | 'future'>[];
  selectedBlockIds: string[];
}