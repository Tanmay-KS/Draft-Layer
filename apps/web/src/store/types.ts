export interface EmailBlock {
  id: string;
  type: 'text' | 'image' | 'button';
  content: string;
  colStart: number; // starting column
  colSpan: number;  // width
  rowStart: number; // starting row
  rowSpan: number;  // height
}

export interface EmailState {
  blocks: EmailBlock[];
  selectedBlockId: string | null;
}
