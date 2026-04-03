"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'; 
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectTarget,
  removeBlock,
  updateBlockPosition,
  updateBlockDimensions,
  addBlock,
  setSelectedBlocks,
  toggleBlockSelection,
  clearSelection,
  moveSelectedBlocks,
  removeSelectedBlocks,
} from "../../store/emailSlice";

import { DndContext, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function Canvas() {
  const dispatch = useAppDispatch();
  
  // MODIFIED: Added selectedBlockIds to your existing useAppSelector to avoid TypeScript errors
  const { blocks, selectedTarget, canvasStyle, selectedBlockIds } = useAppSelector(
    (state) => state.email
  );

  // Handle clicking the empty canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      dispatch(clearSelection());
    }
  };

  // Handle clicking an individual block
  const handleBlockClick = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation(); // Prevent canvas click from firing
    
    if (e.shiftKey) {
      dispatch(toggleBlockSelection(blockId));
    } else {
      dispatch(setSelectedBlocks([blockId]));
    }
  };

  const [showGrid, setShowGrid] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const selectedBlock = selectedTarget?.type === "block"
    ? blocks.find((block) => block.id === selectedTarget.id)
    : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch(clearSelection());
        return;
      }

      if (selectedBlockIds.length === 0) return;

      // Bulk Delete (1 clean dispatch)
      if (e.key === "Delete" || e.key === "Backspace") {
        dispatch(removeSelectedBlocks());
        return;
      }

      // Bulk Duplicate (Ctrl+D) - We keep this loop here because we need random UUIDs
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        selectedBlockIds.forEach(id => {
          const block = blocks.find(b => b.id === id);
          if (!block) return;
          const newId = crypto.randomUUID();
          dispatch(
            addBlock({
              id: newId,
              type: block.type,
              layout: {
                ...block.layout,
                colStart: block.layout.colStart + 1,
                rowStart: block.layout.rowStart + 1,
              },
              content: { ...block.content },
              style: block.style,
            })
          );
        });
        return;
      }

      // Bulk Move (1 clean dispatch)
      const step = e.shiftKey ? 5 : 1;
      let colChange = 0;
      let rowChange = 0;

      if (e.key === "ArrowLeft") colChange = -step;
      if (e.key === "ArrowRight") colChange = step;
      if (e.key === "ArrowUp") rowChange = -step;
      if (e.key === "ArrowDown") rowChange = step;

      if (colChange !== 0 || rowChange !== 0) {
        e.preventDefault();
        dispatch(moveSelectedBlocks({ colChange, rowChange }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, selectedBlockIds, blocks]);
  
  const cellSize = 20;
  const MAX_ROWS = 100;

  const maxUsedRow = blocks.reduce((max, block) => {
    const end = block.layout.rowStart + block.layout.rowSpan - 1;
    return Math.max(max, end);
  }, 0);

  const visualRows = Math.max(maxUsedRow + 4, 20);

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  const handleDragEnd = (event: any) => {
    const { active, delta } = event;

    const block = blocks.find((b) => b.id === active.id);
    if (!block) return;

    const gridElement = document.getElementById("canvas-grid");
    if (!gridElement) return;

    const cellWidth = gridElement.clientWidth / 48;
    const rowHeight = cellSize;

    // 1. Calculate how many grid cells the mouse moved
    const colChange = Math.floor(delta.x / cellWidth);
    const rowChange = Math.ceil(delta.y / rowHeight);

    if (colChange === 0 && rowChange === 0) return;

    // 2. MULTI-DRAG: If the dragged block is part of our selected group, move them all!
    if (selectedBlockIds.includes(block.id)) {
      dispatch(moveSelectedBlocks({ colChange, rowChange }));
    } 
    // 3. SINGLE DRAG: If they grabbed an unselected block, just move that specific one
    else {
      const newCol = block.layout.colStart + colChange;
      const newRow = block.layout.rowStart + rowChange;

      dispatch(
        updateBlockPosition({
          id: block.id,
          colStart: clamp(newCol, 1, 48 - block.layout.colSpan + 1),
          rowStart: clamp(newRow, 1, MAX_ROWS - block.layout.rowSpan + 1),
        })
      );
    }
  };

  function DraggableBlock({ block }: { block: any }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({ id: block.id });

    // MODIFIED: Now checks the array to support multi-select borders
    const isSelected = selectedBlockIds.includes(block.id);

    const style = {
      transform: CSS.Transform.toString(transform),
      gridColumn: `${block.layout.colStart} / span ${block.layout.colSpan}`,
      gridRow: `${block.layout.rowStart} / span ${block.layout.rowSpan}`,
      background: block.style.backgroundColor,
      padding: "12px",
      border: `${block.style.border.width}px solid ${block.style.border.color}`,
      borderRadius: `${block.style.border.radius}px`,
      opacity: block.style.opacity,
      position: "relative" as const,
      cursor: isDragging ? "grabbing" : "default",
      boxShadow: isDragging
        ? "0 20px 40px rgba(0,0,0,0.35)"
        : isSelected
        ? "0 0 0 2px #3b82f6"
        : "0 2px 6px rgba(0,0,0,0.08)",
      transition:
        "box-shadow 180ms ease, border 180ms ease, background-color 180ms ease, opacity 180ms ease",
      fontFamily: block.style.fontFamily,
      fontSize: block.style.fontSize ? `${block.style.fontSize}px` : undefined,
      fontWeight: block.style.fontWeight,
      textAlign: block.style.textAlign,
      color: block.style.color,
    };

    type ResizeDir =
      | "right"
      | "left"
      | "bottom"
      | "top"
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right";

    const handleStyle = (position: string) => {
      const base = {
        position: "absolute" as const,
        width: "10px",
        height: "10px",
        background: "#3b82f6",
        zIndex: 10,
        transition: "background 160ms ease, opacity 160ms ease",
      };

      switch (position) {
        case "top":
          return { ...base, top: "-5px", left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" };
        case "bottom":
          return { ...base, bottom: "-5px", left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" };
        case "left":
          return { ...base, left: "-5px", top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" };
        case "right":
          return { ...base, right: "-5px", top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" };
        case "top-left":
          return { ...base, top: "-5px", left: "-5px", cursor: "nwse-resize" };
        case "top-right":
          return { ...base, top: "-5px", right: "-5px", cursor: "nesw-resize" };
        case "bottom-left":
          return { ...base, bottom: "-5px", left: "-5px", cursor: "nesw-resize" };
        case "bottom-right":
          return { ...base, bottom: "-5px", right: "-5px", cursor: "nwse-resize" };
        default:
          return base;
      }
    };

    const startResize = (e: React.MouseEvent, direction: ResizeDir) => {
      e.stopPropagation();
      e.preventDefault();
      document.body.style.cursor = "grabbing";

      const startX = e.clientX;
      const startY = e.clientY;

      const startColSpan = block.layout.colSpan;
      const startRowSpan = block.layout.rowSpan;
      const startColStart = block.layout.colStart;
      const startRowStart = block.layout.rowStart;

      const gridElement = document.getElementById("canvas-grid");
      if (!gridElement) return;

      const cellWidth = gridElement.clientWidth / 48;
      const rowHeight = cellSize * 2;

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

        if (direction.includes("right")) newColSpan = Math.max(1, startColSpan + colChange);
        if (direction.includes("left")) {
          newColSpan = Math.max(1, startColSpan - colChange);
          newColStart = startColStart + colChange;
        }
        if (direction.includes("bottom")) newRowSpan = Math.max(1, startRowSpan + rowChange);
        if (direction.includes("top")) {
          newRowSpan = Math.max(1, startRowSpan - rowChange);
          newRowStart = startRowStart + rowChange;
        }

        if (newColStart < 1) return;
        if (newColStart + newColSpan - 1 > 48) return;
        if (newRowStart < 1) return;
        if (newRowStart + newRowSpan - 1 > MAX_ROWS) return;

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
        document.body.style.cursor = "default";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        // MODIFIED: Replaced selectTarget with the new handleBlockClick function
        onClick={(e) => handleBlockClick(e, block.id)}
      >
        <div
          {...listeners}
          {...attributes}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            background: "#f3f4f6",
            padding: "4px",
            marginBottom: "6px",
            fontSize: "12px",
            textAlign: "center",
            borderRadius: "4px",
            transition: "background-color 160ms ease",
          }}
        >
          Drag
        </div>

        {/* Replace the old content <strong> and <div> with this: */}
        {block.type === "image" ? (
          <img
            src={block.content.url || "https://placehold.co/400x300?text=Placeholder+Image"}
            alt={block.content.alt || "Email Image"}
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover", 
              display: "block" 
            }}
            draggable={false} // Prevents native image dragging from breaking Dnd-kit
          />
        ) : block.type === "button" ? (
          <a
            href={block.content.href || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: block.style.textAlign || "center",
              textDecoration: "none",
              color: "inherit",
              fontWeight: "inherit",
            }}
          >
            {block.content.value || "Button"}
          </a>
        ) : (
          <>
            <strong>{block.type.toUpperCase()}</strong>
            <div>{block.content.value}</div>
          </>
        )}

        {isSelected &&
          ["right","left","bottom","top","top-left","top-right","bottom-left","bottom-right"].map((pos) => (
            <div
              key={pos}
              style={handleStyle(pos)}
              onMouseDown={(e) => startResize(e, pos as ResizeDir)}
            />
          ))}

        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch(removeBlock(block.id));
          }}
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            background: "red",
            color: "white",
            border: "none",
            cursor: "pointer",
            transition: "opacity 150ms ease",
          }}
        >
          X
        </button>
      </div>
    );
  }

  const isCanvasSelected = selectedTarget?.type === "canvas";

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ flex: 1, overflow: "auto", padding: "10px" }}>
        <div
          id="canvas-grid"
          // MODIFIED: Uses handleCanvasClick to safely clear selections
          onClick={handleCanvasClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{
            minHeight: `${visualRows * cellSize*2}px`,
            backgroundColor: canvasStyle.backgroundColor,
            // ✅ New safe code
            border: canvasStyle.border 
              ? `${canvasStyle.border.width}px solid ${canvasStyle.border.color}` 
              : 'none',
            // Check if border exists BEFORE accessing radius
            borderRadius: canvasStyle.border ? `${canvasStyle.border.radius}px` : '0px',
            display: "grid",
            gridTemplateColumns: "repeat(48, 1fr)",
            gridAutoRows: `${cellSize}px`,
            position: "relative",
            boxShadow: isCanvasSelected
              ? "0 0 0 2px #3b82f6 inset"
              : "none",
            transition: "background-color 180ms ease, border 180ms ease, box-shadow 180ms ease",
            backgroundImage: showGrid || isHovering
              ? `
                linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
              `
              : "none",
            backgroundSize: `${100 / 48}% ${cellSize}px`,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowGrid((prev) => !prev);
            }}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 1000,
              padding: "6px 10px",
              background: "#222",
              color: "white",
              border: "1px solid #555",
              cursor: "pointer",
              transition: "opacity 150ms ease",
            }}
          >
            {showGrid ? "Hide Grid" : "Show Grid"}
          </button>

          {blocks.map((block) => (
            <DraggableBlock key={block.id} block={block} />
          ))}
        </div>
      </div>
    </DndContext>
  );
}