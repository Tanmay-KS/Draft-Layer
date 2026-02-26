import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmailState, EmailBlock, BlockStyle } from './types';

const defaultCanvasStyle: BlockStyle = {
  backgroundColor: '#f8f9fa',
  border: {
    width: 0,
    color: '#000000',
    radius: 0,
  },
  shadow: 'none',
  opacity: 1,
};

const defaultBlockStyle: BlockStyle = {
  backgroundColor: '#ffffff',
  border: {
    width: 1,
    color: '#dddddd',
    radius: 4,
  },
  shadow: 'none',
  opacity: 1,
};

const initialState: EmailState = {
  blocks: [],
  selectedTarget: null,
  canvasStyle: defaultCanvasStyle,
};

function isOverlapping(a: EmailBlock, b: EmailBlock) {
  const aColEnd = a.layout.colStart + a.layout.colSpan - 1;
  const aRowEnd = a.layout.rowStart + a.layout.rowSpan - 1;

  const bColEnd = b.layout.colStart + b.layout.colSpan - 1;
  const bRowEnd = b.layout.rowStart + b.layout.rowSpan - 1;

  const horizontalOverlap =
    a.layout.colStart <= bColEnd &&
    aColEnd >= b.layout.colStart;

  const verticalOverlap =
    a.layout.rowStart <= bRowEnd &&
    aRowEnd >= b.layout.rowStart;

  return horizontalOverlap && verticalOverlap;
}

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    addBlock: (
      state,
      action: PayloadAction<{
        id: string;
        type: string;
        layout: {
          colStart: number;
          colSpan: number;
          rowStart: number;
          rowSpan: number;
        };
        content: {
          value: string;
        };
      }>
    ) => {
      const newBlock: EmailBlock = {
        id: action.payload.id,
        type: action.payload.type,
        layout: { ...action.payload.layout },
        style: { ...defaultBlockStyle },
        content: { ...action.payload.content },
      };

      const maxCols = 48;
      const maxRows = 100;
      let placed = false;

      for (let row = 1; row <= maxRows && !placed; row++) {
        for (
          let col = 1;
          col <= maxCols - newBlock.layout.colSpan + 1;
          col++
        ) {
          const proposed: EmailBlock = {
            ...newBlock,
            layout: {
              ...newBlock.layout,
              colStart: col,
              rowStart: row,
            },
          };

          const collision = state.blocks.some((existing) =>
            isOverlapping(proposed, existing)
          );

          if (!collision) {
            newBlock.layout.colStart = col;
            newBlock.layout.rowStart = row;
            placed = true;
            break;
          }
        }
      }

      if (placed) {
        state.blocks.push(newBlock);
      }
    },

    removeBlock: (state, action: PayloadAction<string>) => {
      state.blocks = state.blocks.filter(
        (block) => block.id !== action.payload
      );

      if (
        state.selectedTarget?.type === 'block' &&
        state.selectedTarget.id === action.payload
      ) {
        state.selectedTarget = null;
      }
    },

    selectTarget: (
      state,
      action: PayloadAction<
        { type: 'block' | 'canvas'; id?: string } | null
      >
    ) => {
      state.selectedTarget = action.payload;
    },

    updateBlockContent: (
      state,
      action: PayloadAction<{ id: string; content: string }>
    ) => {
      const block = state.blocks.find(
        (block) => block.id === action.payload.id
      );
      if (block) {
        block.content.value = action.payload.content;
      }
    },

    updateBlockWidth: (
      state,
      action: PayloadAction<{ id: string; colSpan: number }>
    ) => {
      const block = state.blocks.find(
        (block) => block.id === action.payload.id
      );
      if (block) {
        block.layout.colSpan = action.payload.colSpan;
      }
    },

    updateBlockHeight: (
      state,
      action: PayloadAction<{ id: string; rowSpan: number }>
    ) => {
      const block = state.blocks.find(
        (block) => block.id === action.payload.id
      );
      if (block) {
        block.layout.rowSpan = action.payload.rowSpan;
      }
    },

    updateBlockPosition: (
      state,
      action: PayloadAction<{
        id: string;
        colStart: number;
        rowStart: number;
      }>
    ) => {
      const block = state.blocks.find(
        (block) => block.id === action.payload.id
      );
      if (!block) return;

      const proposed: EmailBlock = {
        ...block,
        layout: {
          ...block.layout,
          colStart: action.payload.colStart,
          rowStart: action.payload.rowStart,
        },
      };

      const hasCollision = state.blocks.some((other) => {
        if (other.id === block.id) return false;
        return isOverlapping(proposed, other);
      });

      if (!hasCollision) {
        block.layout.colStart = action.payload.colStart;
        block.layout.rowStart = action.payload.rowStart;
      }
    },

    updateBlockStyle: (
      state,
      action: PayloadAction<{
        id: string;
        style: Partial<BlockStyle>;
      }>
    ) => {
      const block = state.blocks.find(
        (b) => b.id === action.payload.id
      );
      if (!block) return;

      const newStyle = action.payload.style;

      if (newStyle.backgroundColor !== undefined) {
        block.style.backgroundColor = newStyle.backgroundColor;
      }

      if (newStyle.opacity !== undefined) {
        block.style.opacity = newStyle.opacity;
      }

      if (newStyle.shadow !== undefined) {
        block.style.shadow = newStyle.shadow;
      }

      if (newStyle.border) {
        block.style.border = {
          ...block.style.border,
          ...newStyle.border,
        };
      }
    },

    updateCanvasStyle: (
      state,
      action: PayloadAction<Partial<BlockStyle>>
    ) => {
      const newStyle = action.payload;

      if (newStyle.backgroundColor !== undefined) {
        state.canvasStyle.backgroundColor =
          newStyle.backgroundColor;
      }

      if (newStyle.opacity !== undefined) {
        state.canvasStyle.opacity = newStyle.opacity;
      }

      if (newStyle.shadow !== undefined) {
        state.canvasStyle.shadow = newStyle.shadow;
      }

      if (newStyle.border) {
        state.canvasStyle.border = {
          ...state.canvasStyle.border,
          ...newStyle.border,
        };
      }
    },

    updateBlockDimensions: (
      state,
      action: PayloadAction<{
        id: string;
        colSpan: number;
        rowSpan: number;
        colStart: number;
        rowStart: number;
      }>
    ) => {
      const block = state.blocks.find(
        (b) => b.id === action.payload.id
      );
      if (!block) return;

      block.layout.colSpan = action.payload.colSpan;
      block.layout.rowSpan = action.payload.rowSpan;
      block.layout.colStart = action.payload.colStart;
      block.layout.rowStart = action.payload.rowStart;
    },

    moveBlock: (
      state,
      action: PayloadAction<{ id: string; direction: 'up' | 'down' }>
    ) => {
      const index = state.blocks.findIndex(
        (block) => block.id === action.payload.id
      );

      if (index === -1) return;

      if (action.payload.direction === 'up' && index > 0) {
        [state.blocks[index - 1], state.blocks[index]] = [
          state.blocks[index],
          state.blocks[index - 1],
        ];
      }

      if (
        action.payload.direction === 'down' &&
        index < state.blocks.length - 1
      ) {
        [state.blocks[index + 1], state.blocks[index]] = [
          state.blocks[index],
          state.blocks[index + 1],
        ];
      }
    },
  },
});

export const {
  addBlock,
  removeBlock,
  selectTarget,
  updateBlockContent,
  moveBlock,
  updateBlockWidth,
  updateBlockPosition,
  updateBlockHeight,
  updateBlockDimensions,
  updateBlockStyle,
  updateCanvasStyle,
} = emailSlice.actions;

export default emailSlice.reducer;