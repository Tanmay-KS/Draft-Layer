'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectBlock,
  removeBlock,
  updateBlockPosition,
} from '../../store/emailSlice';

import { DndContext, useDraggable } from '@dnd-kit/core';

export default function Canvas() {
  const dispatch = useAppDispatch();
  const { blocks, selectedBlockId } = useAppSelector(
    (state) => state.email
  );

  const [showGrid, setShowGrid] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const effectiveShowGrid =
  showGrid
    ? true
    : isDragging || isHovering;
  const handleDragEnd = (event: any) => {
    const { active, delta } = event;

    const block = blocks.find((b) => b.id === active.id);
    if (!block) return;

    const gridElement = document.getElementById('canvas-grid');
    if (!gridElement) return;

    const cellWidth = gridElement.clientWidth / 48;
    const rowHeight = 40;

    const newCol =
      block.colStart + Math.round(delta.x / cellWidth);

    const newRow =
      block.rowStart + Math.round(delta.y / rowHeight);

    dispatch(
      updateBlockPosition({
        id: block.id,
        colStart: Math.max(1, newCol),
        rowStart: Math.max(1, newRow),
      })
    );
  };

  function DraggableBlock({ block }: { block: any }) {
    const { attributes, listeners, setNodeRef, transform } =
      useDraggable({
        id: block.id,
      });

    const style = {
      transform: transform
        ? `translate(${transform.x}px, ${transform.y}px)`
        : undefined,
      gridColumn: `${block.colStart} / span ${block.colSpan}`,
      gridRow: `${block.rowStart} / span ${block.rowSpan}`,
      background: 'white',
      padding: '10px',
      border:
        selectedBlockId === block.id
          ? '2px solid blue'
          : '1px solid #ddd',
      cursor: 'grab',
      position: 'relative' as const,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={() => dispatch(selectBlock(block.id))}
      >
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
        <div>{block.content}</div>
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
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#f8f9fa',
          display: 'grid',
          gridTemplateColumns: 'repeat(48, 1fr)',
          gridAutoRows: '40px',
          gap: '5px',
          position: 'relative',

          backgroundImage: effectiveShowGrid
            ? `
              linear-gradient(to right, rgba(0,0,0,${
                isDragging ? 0.25 : 0.08
              }) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,${
                isDragging ? 0.25 : 0.08
              }) 1px, transparent 1px)
            `
            : 'none',

          backgroundSize: `${100 / 48}% 40px`,
        }}
      >
        {/* Grid Toggle Button */}
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

        {blocks.map((block) => (
          <DraggableBlock
            key={block.id}
            block={block}
          />
        ))}
      </div>
    </DndContext>
  );
}