"use client";

import styled from "@emotion/styled";
import React, { useState } from "react";
import { spacing, colors } from "../../styles/tokens";

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
} from "../../store/emailSlice";

const Wrapper = styled.div`
  width: 300px;
  border-left: 1px solid ${colors.neutral[300]};
  padding: ${spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

/* ✨ ACTIVE HEADER STYLE */
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

  const { blocks, selectedTarget, canvasStyle } = useAppSelector(
    (state) => state.email
  );
  const selectedBlock =
    selectedTarget?.type === "block"
      ? blocks.find((block) => block.id === selectedTarget.id)
      : null;

  if (!selectedBlock && selectedTarget?.type !== "canvas") {
    return (
      <Wrapper>
        <Title>Inspector</Title>
        <p>No block selected</p>
      </Wrapper>
    );
  }

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
      {/* ✨ ACTIVE PROP ADDED */}
      <Title active={selectedTarget?.type === "block"}>
        Inspector
      </Title>

      {selectedBlock && (
        <InspectorSection title="Layout">
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
      )}

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

        {selectedTarget?.type === "block" && selectedBlock && (
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
      <InspectorSection title="Typography">
        {selectedBlock && (
          <>
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
                          ? "normal" // ✅ This is the fixed toggle logic!
                          : "bold",
                    },
                  })
                )
              }
            />
          </>
        )}
      </InspectorSection>
    </Wrapper>
  );
}