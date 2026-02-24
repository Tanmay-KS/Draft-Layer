'use client';

import { useState,useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectTarget,
  removeBlock,
  updateBlockPosition,
  updateBlockWidth,
  updateBlockHeight,
  updateBlockDimensions,
  updateBlockStyle,
  updateCanvasStyle,
} from '../../store/emailSlice';

import { DndContext, useDraggable } from '@dnd-kit/core';

export default function Canvas() {
  const dispatch = useAppDispatch();
  const { blocks, selectedTarget ,canvasStyle} = useAppSelector(
    (state) => state.email
  );

  const [showGrid, setShowGrid] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cellSize] = useState(20);

  const MAX_ROWS = 100;

  const effectiveShowGrid =
    showGrid ? true : isDragging || isHovering;
  
  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  const handleDragEnd = (event: any) => {
    const { active, delta } = event;

    console.log("Drag ended", active.id);
    const block = blocks.find((b) => b.id === active.id);
    if (!block) return;

    const gridElement = document.getElementById('canvas-grid');
    if (!gridElement) return;

    const cellWidth = gridElement.clientWidth / 48;
    const rowHeight = cellSize;

    const newCol =
      block.layout.colStart + Math.round(delta.x / cellWidth);

    const newRow =
      block.layout.rowStart + Math.round(delta.y / rowHeight);

    dispatch(
      updateBlockPosition({
        id: block.id,
        colStart: clamp(
          newCol,
          1,
          48 - block.layout.colSpan + 1
        ),
        rowStart: clamp(
          newRow,
          1,
          MAX_ROWS - block.layout.rowSpan + 1
        ),
      })
    );
  };

  function DraggableBlock({ block }: { block: any }) {
    const { attributes, listeners, setNodeRef, transform } =
      useDraggable({
        id: block.id,
      });

    type ResizeDir =
      | 'right'
      | 'left'
      | 'bottom'
      | 'top'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';

    const style = {
      transform: transform
        ? `translate(${transform.x}px, ${transform.y}px)`
        : undefined,

      gridColumn: `${block.layout.colStart} / span ${block.layout.colSpan}`,
      gridRow: `${block.layout.rowStart} / span ${block.layout.rowSpan}`,

      background: block.style.backgroundColor,
      padding: '10px',

      border:
        selectedTarget?.type === 'block' &&
        selectedTarget.id === block.id
          ? `2px solid blue`
          : `${block.style.border.width}px solid ${block.style.border.color}`,

      borderRadius: `${block.style.border.radius}px`,
      opacity: block.style.opacity,
      
      cursor: 'grab',
      position: 'relative' as const,
    };

    const handleStyle = (position: string) => {
      const base = {
        position: 'absolute' as const,
        width: '10px',
        height: '10px',
        background: 'white',
        border: '2px solid blue',
        zIndex: 10,
      };
      switch (position) {
        case 'top':
          return { ...base, top: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' };
        case 'bottom':
          return { ...base, bottom: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' };
        case 'left':
          return { ...base, left: '-5px', top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' };
        case 'right':
          return { ...base, right: '-5px', top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' };
        case 'top-left':
          return { ...base, top: '-5px', left: '-5px', cursor: 'nwse-resize' };
        case 'top-right':
          return { ...base, top: '-5px', right: '-5px', cursor: 'nesw-resize' };
        case 'bottom-left':
          return { ...base, bottom: '-5px', left: '-5px', cursor: 'nesw-resize' };
        case 'bottom-right':
          return { ...base, bottom: '-5px', right: '-5px', cursor: 'nwse-resize' };
        default:
          return base;
      }
    };

    const startResize = (e: React.MouseEvent, direction: ResizeDir) => {
      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;

      const startColSpan = block.layout.colSpan;
      const startRowSpan = block.layout.rowSpan;
      const startColStart = block.layout.colStart;
      const startRowStart = block.layout.rowStart;

      const gridElement = document.getElementById('canvas-grid');
      if (!gridElement) return;

      const cellWidth = gridElement.clientWidth / 48;
      const rowHeight = cellSize;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        const colChange =
          deltaX >= 0
            ? Math.floor(deltaX / cellWidth)
            : Math.ceil(deltaX / cellWidth);

        const rowChange =
          deltaY >= 0
            ? Math.floor(deltaY / rowHeight)
            : Math.ceil(deltaY / rowHeight);

        let newColSpan = startColSpan;
        let newRowSpan = startRowSpan;
        let newColStart = startColStart;
        let newRowStart = startRowStart;

        if (direction.includes('right')) {
          newColSpan = Math.max(1, startColSpan + colChange);
        }

        if (direction.includes('left')) {
          newColSpan = Math.max(1, startColSpan - colChange);
          newColStart = startColStart + colChange;
        }

        if (direction.includes('bottom')) {
          newRowSpan = Math.max(1, startRowSpan + rowChange);
        }

        if (direction.includes('top')) {
          newRowSpan = Math.max(1, startRowSpan - rowChange);
          newRowStart = startRowStart + rowChange;
        }

        if (newColStart < 1) return;
        if (newColStart + newColSpan - 1 > 48) return;
        if (newRowStart < 1) return;
        if (newRowStart + newRowSpan - 1 > MAX_ROWS) return;

        if (
          newColSpan === block.layout.colSpan &&
          newRowSpan === block.layout.rowSpan &&
          newColStart === block.layout.colStart &&
          newRowStart === block.layout.rowStart
        ) {
          return;
        }

        dispatch(
          updateBlockDimensions({
            id: block.id,
            colSpan: newColSpan,
            rowSpan: newRowSpan,
            colStart: newColStart,
            rowStart: newRowStart,
          })
        );
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={(e) => {
          e.stopPropagation();

          if (
            selectedTarget?.type === 'block' &&
            selectedTarget.id === block.id
          ) {
            dispatch(selectTarget(null));
          } else {
            dispatch(selectTarget({ type: 'block', id: block.id }));
          }
        }}
      >
        {selectedTarget?.type === 'block' &&
          selectedTarget.id === block.id && (
            <>
              <div style={handleStyle('right')} onMouseDown={(e) => startResize(e, 'right')} />
              <div style={handleStyle('left')} onMouseDown={(e) => startResize(e, 'left')} />
              <div style={handleStyle('bottom')} onMouseDown={(e) => startResize(e, 'bottom')} />
              <div style={handleStyle('top')} onMouseDown={(e) => startResize(e, 'top')} />
              <div style={handleStyle('top-left')} onMouseDown={(e) => startResize(e, 'top-left')} />
              <div style={handleStyle('top-right')} onMouseDown={(e) => startResize(e, 'top-right')} />
              <div style={handleStyle('bottom-left')} onMouseDown={(e) => startResize(e, 'bottom-left')} />
              <div style={handleStyle('bottom-right')} onMouseDown={(e) => startResize(e, 'bottom-right')} />
            </>
          )}

        <div
          {...listeners}
          {...attributes}
          style={{
            cursor: 'grab',
            background: '#eee',
            padding: '4px',
            marginBottom: '6px',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          Drag
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch(removeBlock(block.id));
          }}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            background: 'red',
            color: 'white',
            border: 'none',
            padding: '3px 6px',
            cursor: 'pointer',
          }}
        >
          X
        </button>

        <strong>{block.type.toUpperCase()}</strong>
        <div>{block.content.value}</div>
      </div>
    );
  }

  return (
    <DndContext
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event) => {
        setIsDragging(false);
        handleDragEnd(event);
      }}
    >
      <div
        id="canvas-grid"
        onClick={() => dispatch(selectTarget(null))}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          flex: 1,
          backgroundColor: canvasStyle.backgroundColor,
          opacity: canvasStyle.opacity,
          border: `${canvasStyle.border.width}px solid ${canvasStyle.border.color}`,
          borderRadius: `${canvasStyle.border.radius}px`,
          display: 'grid',
          gridTemplateColumns: 'repeat(48, 1fr)',
          gridAutoRows: `${cellSize}px`,
          position: 'relative',
          backgroundImage: effectiveShowGrid
            ? `
              linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
            `
            : 'none',
          backgroundSize: `${100 / 48}% ${cellSize}px`,
        }}
      >
        <button
          onClick={() => setShowGrid((prev) => !prev)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '6px 10px',
            background: '#222',
            color: 'white',
            border: '1px solid #555',
            cursor: 'pointer',
          }}
        >
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
        <button
          onClick={() => {
            if (blocks.length > 0) {
              dispatch(
                updateBlockStyle({
                  id: blocks[0].id,
                  style: { backgroundColor: 'pink' },
                })
              );
            }
          }}
          style={{
            position: 'absolute',
            top: '50px',
            right: '10px',
            zIndex: 1000,
          }}
        >
          TEST STYLE
        </button>
        {blocks.map((block) => (
          <DraggableBlock key={block.id} block={block} />
        ))}
      </div>
    </DndContext>
  );
}