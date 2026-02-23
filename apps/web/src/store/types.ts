export interface BlockStyle {
  backgroundColor: string;
  border: {
    width: number;
    color: string;
    radius: number;
  };
  shadow: string;
  opacity: number;
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
  };
}

export interface EmailState {
  blocks: EmailBlock[];
  selectedBlockId: string | null;
}
