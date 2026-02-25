"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectTarget,
  removeBlock,
  updateBlockPosition,
  updateBlockDimensions,
} from "../../store/emailSlice";

import { DndContext, useDraggable } from "@dnd-kit/core";

export default function Canvas() {
  const dispatch = useAppDispatch();
  const { blocks, selectedTarget, canvasStyle } = useAppSelector(
    (state) => state.email
  );

  const [isDragging, setIsDragging] = useState(false);
  const [cellSize] = useState(20);

  const MAX_ROWS = 100;

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
    const { attributes, listeners, setNodeRef, transform } =
      useDraggable({ id: block.id });

    const isSelected =
      selectedTarget?.type === "block" &&
      selectedTarget.id === block.id;

    const style = {
      transform: transform
        ? `translate(${transform.x}px, ${transform.y}px)`
        : undefined,

      gridColumn: `${block.layout.colStart} / span ${block.layout.colSpan}`,
      gridRow: `${block.layout.rowStart} / span ${block.layout.rowSpan}`,

      background: block.style.backgroundColor,
      padding: "10px",
      border: `${block.style.border.width}px solid ${block.style.border.color}`,
      borderRadius: `${block.style.border.radius}px`,
      opacity: block.style.opacity,

      cursor: "grab",
      position: "relative" as const,

      boxShadow: isSelected
        ? "0 0 0 2px #3b82f6, 0 8px 20px rgba(59,130,246,0.25)"
        : "0 2px 6px rgba(0,0,0,0.06)",

      transition:
        "box-shadow 0.2s ease, border 0.2s ease, background 0.2s ease, opacity 0.2s ease",
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
        width: "12px",
        height: "12px",
        background: "#ffffff",
        border: "2px solid #3b82f6",
        borderRadius: "4px",
        zIndex: 10,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        transition: "all 0.15s ease",
      };

      switch (position) {
        case "top":
          return { ...base, top: "-6px", left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" };
        case "bottom":
          return { ...base, bottom: "-6px", left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" };
        case "left":
          return { ...base, left: "-6px", top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" };
        case "right":
          return { ...base, right: "-6px", top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" };
        case "top-left":
          return { ...base, top: "-6px", left: "-6px", cursor: "nwse-resize" };
        case "top-right":
          return { ...base, top: "-6px", right: "-6px", cursor: "nesw-resize" };
        case "bottom-left":
          return { ...base, bottom: "-6px", left: "-6px", cursor: "nesw-resize" };
        case "bottom-right":
          return { ...base, bottom: "-6px", right: "-6px", cursor: "nwse-resize" };
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

        if (direction.includes("right")) {
          newColSpan = Math.max(1, startColSpan + colChange);
        }
        if (direction.includes("left")) {
          newColSpan = Math.max(1, startColSpan - colChange);
          newColStart = startColStart + colChange;
        }
        if (direction.includes("bottom")) {
          newRowSpan = Math.max(1, startRowSpan + rowChange);
        }
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
          if (isSelected) {
            dispatch(selectTarget(null));
          } else {
            dispatch(selectTarget({ type: "block", id: block.id }));
          }
        }}
      >
        {isSelected &&
          ["right","left","bottom","top","top-left","top-right","bottom-left","bottom-right"].map((pos) => (
            <div
              key={pos}
              style={handleStyle(pos)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 0 3px rgba(59,130,246,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 2px 6px rgba(0,0,0,0.15)";
              }}
              onMouseDown={(e) => startResize(e, pos as ResizeDir)}
            />
          ))}

        <div {...listeners} {...attributes}
          style={{
            cursor: "grab",
            background: "#f3f4f6",
            padding: "4px",
            marginBottom: "6px",
            fontSize: "12px",
            textAlign: "center",
            borderRadius: "4px",
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
            position: "absolute",
            top: "6px",
            right: "6px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "4px 6px",
            cursor: "pointer",
          }}
        >
          X
        </button>

        <strong>{block.type.toUpperCase()}</strong>
        <div>{block.content.value}</div>
      </div>
    );
  }

  const isCanvasSelected =
    selectedTarget?.type === "canvas";

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
        onClick={() =>
          dispatch(selectTarget({ type: "canvas" }))
        }
        style={{
          flex: 1,
          backgroundColor: canvasStyle.backgroundColor,
          opacity: canvasStyle.opacity,
          border: `${canvasStyle.border.width}px solid ${canvasStyle.border.color}`,
          borderRadius: `${canvasStyle.border.radius}px`,
          display: "grid",
          gridTemplateColumns: "repeat(48, 1fr)",
          gridAutoRows: `${cellSize}px`,
          position: "relative",
          boxShadow: isCanvasSelected
            ? "0 0 0 2px #3b82f6 inset"
            : "none",
          transition:
            "box-shadow 0.2s ease, border 0.2s ease, background 0.2s ease",
        }}
      >
        {blocks.map((block) => (
          <DraggableBlock key={block.id} block={block} />
        ))}
      </div>
    </DndContext>
  );
}