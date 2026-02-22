import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmailState, EmailBlock } from './types';

const initialState: EmailState = {
  blocks: [],
  selectedBlockId: null,
};
function isOverlapping(a: any, b: any) {
  const aColEnd = a.colStart + a.colSpan - 1;
  const aRowEnd = a.rowStart + a.rowSpan - 1;

  const bColEnd = b.colStart + b.colSpan - 1;
  const bRowEnd = b.rowStart + b.rowSpan - 1;

  const horizontalOverlap =
    a.colStart <= bColEnd && aColEnd >= b.colStart;

  const verticalOverlap =
    a.rowStart <= bRowEnd && aRowEnd >= b.rowStart;

  return horizontalOverlap && verticalOverlap;
}
const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    
    addBlock: (state, action: PayloadAction<EmailBlock>) => {
      const newBlock = { ...action.payload };

      const maxCols = 48;
      const maxRows = 100; // arbitrary grid height limit

      let placed = false;

      for (let row = 1; row <= maxRows && !placed; row++) {
        for (
          let col = 1;
          col <= maxCols - newBlock.colSpan + 1;
          col++
        ) {
          const proposed = {
            ...newBlock,
            colStart: col,
            rowStart: row,
          };

          const collision = state.blocks.some((existing) =>
            isOverlapping(proposed, existing)
          );

          if (!collision) {
            newBlock.colStart = col;
            newBlock.rowStart = row;
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
      // If the deleted block was selected, clear selection
      if (state.selectedBlockId === action.payload) {
        state.selectedBlockId = null;
      }
    },

    selectBlock: (state, action: PayloadAction<string | null>) => {
      state.selectedBlockId = action.payload;
    },

    updateBlockContent: (state,action: PayloadAction<{ id: string; content: string }>) => {
      const block = state.blocks.find(
        (block) => block.id === action.payload.id
      );
      if (block) {
        block.content = action.payload.content;
      }
    },

    updateBlockWidth: (state,action: PayloadAction<{ id: string; colSpan: number }>) => {
      const block = state.blocks.find(
        (block) => block.id === action.payload.id
      );
      if (block) {
        block.colSpan = action.payload.colSpan;
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

      const proposed = {
        ...block,
        colStart: action.payload.colStart,
        rowStart: action.payload.rowStart,
      };

      // Check collision with all other blocks
      const hasCollision = state.blocks.some((other) => {
        if (other.id === block.id) return false;
        return isOverlapping(proposed, other);
      });

      if (!hasCollision) {
        block.colStart = action.payload.colStart;
        block.rowStart = action.payload.rowStart;
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

      block.colSpan = action.payload.colSpan;
      block.rowSpan = action.payload.rowSpan;
      block.colStart = action.payload.colStart;
      block.rowStart = action.payload.rowStart;
    },
    updateBlockHeight: (
      state,
      action: PayloadAction<{ id: string; rowSpan: number }>
    ) => {
      const block = state.blocks.find(
        (block) => block.id === action.payload.id
      );
      if (block) {
        block.rowSpan = action.payload.rowSpan;
      }
    },
    moveBlock: (state,action: PayloadAction<{ id: string; direction: 'up' | 'down' }>) => {
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
  selectBlock,
  updateBlockContent,
  moveBlock,
  updateBlockWidth,
  updateBlockPosition,
  updateBlockHeight,
  updateBlockDimensions,
} = emailSlice.actions;
export default emailSlice.reducer;
