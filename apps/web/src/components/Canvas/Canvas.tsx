"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectTarget,
  removeBlock,
  updateBlockPosition,
  updateBlockDimensions,
} from "../../store/emailSlice";

import { DndContext, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function Canvas() {
  const dispatch = useAppDispatch();
  const { blocks, selectedTarget, canvasStyle } = useAppSelector(
    (state) => state.email
  );

  const [showGrid, setShowGrid] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // ✅ ESC deselect (UI only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch(selectTarget(null));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const cellSize = 20;
  const MAX_ROWS = 100;

  const maxUsedRow = blocks.reduce((max, block) => {
    const end =
      block.layout.rowStart + block.layout.rowSpan - 1;
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
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({ id: block.id });

    const isSelected =
      selectedTarget?.type === "block" &&
      selectedTarget.id === block.id;

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
      const rowHeight = cellSize;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        const colChange = Math.round(deltaX / cellWidth);
        const rowChange = Math.round(deltaY / rowHeight);

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
        onClick={(e) => {
          e.stopPropagation();
          dispatch(selectTarget({ type: "block", id: block.id }));
        }}
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

        <strong>{block.type.toUpperCase()}</strong>
        <div>{block.content.value}</div>

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

  const isCanvasSelected =
    selectedTarget?.type === "canvas";

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ flex: 1, overflow: "auto", padding: "10px" }}>
        <div
          id="canvas-grid"
          onClick={() => dispatch(selectTarget({ type: "canvas" }))}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{
            minHeight: `${visualRows * cellSize}px`,
            backgroundColor: canvasStyle.backgroundColor,
            border: `${canvasStyle.border.width}px solid ${canvasStyle.border.color}`,
            borderRadius: `${canvasStyle.border.radius}px`,
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