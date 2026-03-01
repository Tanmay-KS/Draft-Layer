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
  past: [],
  future: [],
};

function snapshotState(state: EmailState) {
  return {
    blocks: JSON.parse(JSON.stringify(state.blocks)),
    selectedTarget: JSON.parse(JSON.stringify(state.selectedTarget)),
    canvasStyle: JSON.parse(JSON.stringify(state.canvasStyle)),
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
      }>
    ) => {
      pushToHistory(state);
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
      pushToHistory(state);
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
      pushToHistory(state);
      state.selectedTarget = action.payload;
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
} = emailSlice.actions;

export default emailSlice.reducer;