"use client";

import styled from "@emotion/styled";
import React from "react";
import { spacing, colors } from "../../styles/tokens";

import { exportHTML } from "../../export/exportHTML";
import { Label } from "../ui/Label";
import { Input } from "../ui/Inputs";
import { Toggle } from "../ui/Toggle";
import { Slider } from "../ui/Slider";
import { InspectorSection } from "../ui/InspectorSection";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  updateBlockContent,
  updateBlockWidth,
  updateBlockPosition,
  updateBlockHeight,
  updateBlockStyle,
  updateCanvasStyle,
  undo,
  redo,
  updateButtonLink,
  updateImageContent
} from "../../store/emailSlice";

const Wrapper = styled.div`
  width: 300px;
  border-left: 1px solid ${colors.neutral[300]};
  padding: ${spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Title = styled.h3<{ active?: boolean }>`
  margin: 0;
  padding: 8px 10px;
  border-radius: 6px;
  font-weight: 600;

  background: ${({ active }) =>
    active ? "rgba(59,130,246,0.08)" : "transparent"};

  color: ${({ active }) =>
    active ? "#1d4ed8" : "#111"};

  transition: background 0.2s ease, color 0.2s ease;
`;

export default function Inspector() {
  const dispatch = useAppDispatch();

  // FIXED: Pulled selectedBlockIds from here to avoid duplicate selector errors
  const { blocks, selectedTarget, canvasStyle, selectedBlockIds } = useAppSelector(
    (state) => state.email
  );

  const selectedBlock =
    selectedTarget?.type === "block"
      ? blocks.find((block) => block.id === selectedTarget.id)
      : null;

  const handleBackgroundChange = (value: string) => {
    if (selectedTarget?.type === "block" && selectedBlock) {
      dispatch(
        updateBlockStyle({
          id: selectedBlock.id,
          style: { backgroundColor: value },
        })
      );
    }

    if (selectedTarget?.type === "canvas") {
      dispatch(
        updateCanvasStyle({
          backgroundColor: value,
        })
      );
    }
  };

  const handleBorderRadiusChange = (value: number) => {
    if (!selectedBlock) return;

    dispatch(
      updateBlockStyle({
        id: selectedBlock.id,
        style: {
          border: {
            width: selectedBlock.style.border.width,
            color: selectedBlock.style.border.color,
            radius: value,
          },
        },
      })
    );
  };

  const handleBorderWidthChange = (value: number) => {
    if (!selectedBlock) return;

    dispatch(
      updateBlockStyle({
        id: selectedBlock.id,
        style: {
          border: {
            width: value,
            color: selectedBlock.style.border.color,
            radius: selectedBlock.style.border.radius,
          },
        },
      })
    );
  };

  const handleOpacityChange = (value: number) => {  
    if (selectedTarget?.type === "block" && selectedBlock) {
      dispatch(
        updateBlockStyle({
          id: selectedBlock.id,
          style: { opacity: value },
        })
      );
    }

    if (selectedTarget?.type === "canvas") {
      dispatch(
        updateCanvasStyle({
          opacity: value,
        })
      );
    }
  };

  return (
    <Wrapper>
      
      <Title active={selectedTarget?.type === "block"}>
        Inspector
      </Title>
    
      {/* Undo / Redo always visible */}
      {/* Global Actions: Undo, Redo, Export */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <button 
          onClick={() => dispatch(undo())}
          style={{ flex: 1, padding: "8px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc", background: "#fff" }}
        >
          Undo
        </button>
        <button 
          onClick={() => dispatch(redo())}
          style={{ flex: 1, padding: "8px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc", background: "#fff" }}
        >
          Redo
        </button>
        <button 
          onClick={() => exportHTML({ blocks, selectedTarget, canvasStyle, selectedBlockIds, past: [], future: [] })}
          style={{ width: "100%", padding: "8px", cursor: "pointer", borderRadius: "4px", border: "none", background: "#007bff", color: "white", fontWeight: "bold" }}
        >
          Export HTML
        </button>
      </div>

      {/* FIXED: Check for multi-select here so Undo/Redo buttons stay visible */}
      {selectedBlockIds && selectedBlockIds.length > 1 ? (
        <div style={{ padding: "20px 0", textAlign: "center", background: "#f9fafb", borderRadius: "8px" }}>
          <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>Multiple blocks selected</p>
          <span style={{ fontSize: "14px", color: "#6b7280" }}>
            {selectedBlockIds.length} blocks currently active.
          </span>
        </div>
      ) : (
        <>
          {/* Nothing selected */}
          {(!selectedTarget || (selectedTarget.type === "canvas" && selectedBlockIds?.length === 0)) && (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Editing Canvas</p>
          )}

          {/* Block Selected */}
          {selectedBlock && (
            <>
              <InspectorSection title="Layout">
                {/* Dynamic Content Inputs */}
                {selectedBlock.type === "image" ? (
                  <>
                    <Label>Image URL</Label>
                    <Input
                      value={selectedBlock.content.url || ""}
                      onChange={(e) =>
                        dispatch(
                          updateImageContent({
                            id: selectedBlock.id,
                            url: e.target.value,
                            alt: selectedBlock.content.alt || "",
                          })
                        )
                      }
                    />
                    <Label>Alt Text</Label>
                    <Input
                      value={selectedBlock.content.alt || ""}
                      onChange={(e) =>
                        dispatch(
                          updateImageContent({
                            id: selectedBlock.id,
                            url: selectedBlock.content.url || "",
                            alt: e.target.value,
                          })
                        )
                      }
                    />
                  </>
                ) : selectedBlock.type === "button" ? (
                  <>
                    <Label>Button Text</Label>
                    <Input
                      value={selectedBlock.content.value}
                      onChange={(e) =>
                        dispatch(
                          updateBlockContent({
                            id: selectedBlock.id,
                            content: e.target.value,
                          })
                        )
                      }
                    />
                    <Label>Button Link</Label>
                    <Input
                      value={selectedBlock.content.href || ""}
                      onChange={(e) =>
                        dispatch(
                          updateButtonLink({
                            id: selectedBlock.id,
                            href: e.target.value,
                          })
                        )
                      }
                    />
                  </>
                ) : (
                  <>
                    <Label>Content</Label>
                    <Input
                      value={selectedBlock.content.value}
                      onChange={(e) =>
                        dispatch(
                          updateBlockContent({
                            id: selectedBlock.id,
                            content: e.target.value,
                          })
                        )
                      }
                    />
                  </>
                )}

                {/* ... Existing Width/Height/Col controls continue below ... */}

                <Label>Width (1–48)</Label>
                <Slider
                  value={selectedBlock.layout.colSpan}
                  min={1}
                  max={48}
                  onChange={(e) =>
                    dispatch(
                      updateBlockWidth({
                        id: selectedBlock.id,
                        colSpan: Number(e.target.value),
                      })
                    )
                  }
                />

                <Label>Column Start</Label>
                <Input
                  type="number"
                  value={selectedBlock.layout.colStart}
                  onChange={(e) =>
                    dispatch(
                      updateBlockPosition({
                        id: selectedBlock.id,
                        colStart: Number(e.target.value),
                        rowStart: selectedBlock.layout.rowStart,
                      })
                    )
                  }
                />

                <Label>Row Start</Label>
                <Input
                  type="number"
                  value={selectedBlock.layout.rowStart}
                  onChange={(e) =>
                    dispatch(
                      updateBlockPosition({
                        id: selectedBlock.id,
                        colStart: selectedBlock.layout.colStart,
                        rowStart: Number(e.target.value),
                      })
                    )
                  }
                />

                <Label>Height (Row Span)</Label>
                <Input
                  type="number"
                  value={selectedBlock.layout.rowSpan}
                  onChange={(e) =>
                    dispatch(
                      updateBlockHeight({
                        id: selectedBlock.id,
                        rowSpan: Number(e.target.value),
                      })
                    )
                  }
                />
              </InspectorSection>

              <InspectorSection title="Typography">
                <Label>Font Size</Label>
                <Slider
                  value={selectedBlock.style.fontSize || 16}
                  min={8}
                  max={72}
                  onChange={(e) =>
                    dispatch(
                      updateBlockStyle({
                        id: selectedBlock.id,
                        style: {
                          fontSize: Number(e.target.value),
                        },
                      })
                    )
                  }
                />

                <Label>Bold</Label>
                <Toggle
                  checked={selectedBlock.style.fontWeight === "bold"}
                  onChange={() =>
                    dispatch(
                      updateBlockStyle({
                        id: selectedBlock.id,
                        style: {
                          fontWeight:
                            selectedBlock.style.fontWeight === "bold"
                              ? "normal"
                              : "bold",
                        },
                      })
                    )
                  }
                />
              </InspectorSection>
            </>
          )}

          {/* Style Section (Block + Canvas) */}
          <InspectorSection title="Style">
            <Label>Background</Label>
            <Input
              value={
                selectedTarget?.type === "canvas"
                  ? canvasStyle.backgroundColor
                  : selectedBlock?.style.backgroundColor || ""
              }
              onChange={(e) =>
                handleBackgroundChange(e.target.value)
              }
            />

            {selectedBlock && (
              <>
                <Label>Border Radius</Label>
                <Slider
                  value={selectedBlock.style.border.radius}
                  min={0}
                  max={50}
                  onChange={(e) =>
                    handleBorderRadiusChange(Number(e.target.value))
                  }
                />

                <Label>Border Width</Label>
                <Slider
                  value={selectedBlock.style.border.width}
                  min={0}
                  max={20}
                  onChange={(e) =>
                    handleBorderWidthChange(Number(e.target.value))
                  }
                />
              </>
            )}

            <Label>Opacity</Label>
            <Slider
              value={
                selectedTarget?.type === "canvas"
                  ? canvasStyle.opacity
                  : selectedBlock?.style.opacity || 1
              }
              min={0}
              max={1}
              step={0.1}
              onChange={(e) =>
                handleOpacityChange(Number(e.target.value))
              }
            />
          </InspectorSection>
        </>
      )}
    </Wrapper>
  );
}