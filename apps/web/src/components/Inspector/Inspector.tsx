"use client";

import styled from "@emotion/styled";
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
} from "../../store/emailSlice";

const Wrapper = styled.div`
  width: 300px;
  border-left: 1px solid ${colors.neutral[300]};
  padding: ${spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Title = styled.h3`
  margin: 0;
`;

export default function Inspector() {
  const dispatch = useAppDispatch();
  const { blocks, selectedTarget } = useAppSelector(
    (state) => state.email
  );

  const selectedBlock =
    selectedTarget?.type === 'block'
      ? blocks.find((block) => block.id === selectedTarget.id)
      : null;

  // 🔹 No block selected state
  if (!selectedBlock) {
    return (
      <Wrapper>
        <Title>Inspector</Title>
        <p>No block selected</p>
      </Wrapper>
    );
  }

  // 🔹 Main Inspector layout
  // 🔹 Main Inspector layout
  return (
    <Wrapper>
      <Title>Inspector</Title>

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

      <InspectorSection title="Style">
        <Label>Background</Label>
        <Input placeholder="#ffffff" />

        <Label>Border Radius</Label>
        <Slider />
      </InspectorSection>

      <InspectorSection title="Typography">
        <Label>Font Size</Label>
        <Slider />

        <Label>Bold</Label>
        <Toggle />
      </InspectorSection>
    </Wrapper>
  );
}