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
  selectedTarget:{type: 'canvas'},
  canvasStyle: defaultCanvasStyle,
  selectedBlockIds: [],
  past: [],
  future: [],
};

function snapshotState(state: EmailState) {
  return {
    blocks: JSON.parse(JSON.stringify(state.blocks)),
    selectedTarget: JSON.parse(JSON.stringify(state.selectedTarget)),
    canvasStyle: JSON.parse(JSON.stringify(state.canvasStyle)),
    // FIX 1: Add selectedBlockIds to the snapshot object so TypeScript is happy
    // and the system remembers selections during Undo/Redo
    selectedBlockIds: [...state.selectedBlockIds], 
  };
}

function pushToHistory(state: EmailState) {
  const snapshot = snapshotState(state);
  state.past.push(snapshot);
  state.future = [];

  if (state.past.length > 50) {
    state.past.shift();
  }
}

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
        style?: BlockStyle;
      }>
    ) => {
      pushToHistory(state);
      const newBlock: EmailBlock = {
        id: action.payload.id,
        type: action.payload.type,
        layout: { ...action.payload.layout },
        style: action.payload.style
          ? JSON.parse(JSON.stringify(action.payload.style))
          : { ...defaultBlockStyle },
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
      pushToHistory(state);
      state.blocks = state.blocks.filter(
        (block) => block.id !== action.payload
      );

      // FIX 2: Ensure the block is also removed from the multi-select array
      state.selectedBlockIds = state.selectedBlockIds.filter(id => id !== action.payload);

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
      pushToHistory(state);
      state.selectedTarget = action.payload;

      // FIX 3: Keep the array synced if `selectTarget` is dispatched from older code
      if (!action.payload || action.payload.type === 'canvas') {
        state.selectedBlockIds = [];
      } else if (action.payload.type === 'block' && action.payload.id) {
        state.selectedBlockIds = [action.payload.id];
      }
    },

    updateBlockContent: (
      state,
      action: PayloadAction<{ id: string; content: string }>
    ) => {
      pushToHistory(state);
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
      pushToHistory(state);

      const block = state.blocks.find(
        (b) => b.id === action.payload.id
      );
      if (!block) return;

      const incomingStyle = action.payload.style;

      block.style = {
        ...block.style,
        ...incomingStyle,
        border: incomingStyle.border
          ? {
              ...block.style.border,
              ...incomingStyle.border,
            }
          : block.style.border,
      };
    },

    updateCanvasStyle: (
      state,
      action: PayloadAction<Partial<BlockStyle>>
    ) => {
      pushToHistory(state);
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
      pushToHistory(state);
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
    undo: (state) => {
      if (state.past.length === 0) return;

      const previous = state.past.pop();
      if (!previous) return;

      const current = snapshotState(state);

      state.future.unshift(current);

      state.blocks = previous.blocks;
      state.selectedTarget = previous.selectedTarget;
      state.canvasStyle = previous.canvasStyle;
      // FIX 4: Restore selections when undoing
      state.selectedBlockIds = previous.selectedBlockIds; 
    },
    redo: (state) => {
      if (state.future.length === 0) return;

      const next = state.future.shift();
      if (!next) return;

      const current = snapshotState(state);

      state.past.push(current);

      state.blocks = next.blocks;
      state.selectedTarget = next.selectedTarget;
      state.canvasStyle = next.canvasStyle;
      // FIX 5: Restore selections when redoing
      state.selectedBlockIds = next.selectedBlockIds; 
    },
    setSelectedBlocks(state, action: PayloadAction<string[]>) {
      state.selectedBlockIds = action.payload;
      
      if (action.payload.length > 0) {
        state.selectedTarget = { type: 'block', id: action.payload[0] };
      } else {
        state.selectedTarget = { type: 'canvas' };
      }
    },

    toggleBlockSelection(state, action: PayloadAction<string>) {
      const blockId = action.payload;
      const isSelected = state.selectedBlockIds.includes(blockId);

      if (isSelected) {
        state.selectedBlockIds = state.selectedBlockIds.filter(id => id !== blockId);
      } else {
        state.selectedBlockIds.push(blockId);
      }

      if (state.selectedBlockIds.length === 0) {
        state.selectedTarget = { type: 'canvas' };
      } else {
        state.selectedTarget = { 
          type: 'block', 
          id: state.selectedBlockIds[state.selectedBlockIds.length - 1] 
        };
      }
    },

    clearSelection(state) {
      state.selectedBlockIds = [];
      state.selectedTarget = { type: 'canvas' };
    },

    // NEW: Bulk move multiple blocks at once cleanly
    moveSelectedBlocks: (
      state,
      action: PayloadAction<{ colChange: number; rowChange: number }>
    ) => {
      if (state.selectedBlockIds.length === 0) return;
      if (action.payload.colChange === 0 && action.payload.rowChange === 0) return;

      // Only save ONE history snapshot for the whole group movement!
      pushToHistory(state); 

      const { colChange, rowChange } = action.payload;

      // 1. Sort the blocks based on direction so they clear a path for each other
      const blocksToMove = state.selectedBlockIds
        .map((id) => state.blocks.find((b) => b.id === id))
        .filter((b): b is EmailBlock => b !== undefined)
        .sort((a, b) => {
          if (colChange > 0) return b.layout.colStart - a.layout.colStart; // Right-most first
          if (colChange < 0) return a.layout.colStart - b.layout.colStart; // Left-most first
          if (rowChange > 0) return b.layout.rowStart - a.layout.rowStart; // Bottom-most first
          if (rowChange < 0) return a.layout.rowStart - b.layout.rowStart; // Top-most first
          return 0;
        });

      // 2. Move them using your exact existing boundary/overlap logic
      blocksToMove.forEach((block) => {
        const maxColStart = 48 - block.layout.colSpan + 1;
        const maxRowStart = 100 - block.layout.rowSpan + 1; // Assuming MAX_ROWS is 100

        const newCol = Math.min(maxColStart, Math.max(1, block.layout.colStart + colChange));
        const newRow = Math.min(maxRowStart, Math.max(1, block.layout.rowStart + rowChange));

        const proposed: EmailBlock = {
          ...block,
          layout: { ...block.layout, colStart: newCol, rowStart: newRow },
        };

        const hasCollision = state.blocks.some((other) => {
          if (other.id === block.id) return false;
          return isOverlapping(proposed, other);
        });

        if (!hasCollision) {
          block.layout.colStart = newCol;
          block.layout.rowStart = newRow;
        }
      });
    },

    // NEW: Bulk delete safely
    removeSelectedBlocks: (state) => {
      if (state.selectedBlockIds.length === 0) return;
      
      // One snapshot for the whole group delete
      pushToHistory(state);

      state.blocks = state.blocks.filter((b) => !state.selectedBlockIds.includes(b.id));
      state.selectedBlockIds = [];
      state.selectedTarget = { type: 'canvas' };
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
  undo,
  redo,
  setSelectedBlocks,
  toggleBlockSelection,
  clearSelection,
  moveSelectedBlocks,
  removeSelectedBlocks,
} = emailSlice.actions;

export default emailSlice.reducer;