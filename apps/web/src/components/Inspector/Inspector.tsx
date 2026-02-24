"use client";

import styled from "@emotion/styled";
import { spacing, colors } from "../../../styles/tokens";

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
  const { blocks, selectedBlockId } = useAppSelector(
    (state) => state.email
  );

  const selectedBlock = blocks.find(
    (block) => block.id === selectedBlockId
  );

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
  return (
    <Wrapper>
      <Title>Inspector</Title>

      <InspectorSection title="Layout">
        <Label>Width</Label>
        <Input placeholder="Enter width" />

        <Label>Height</Label>
        <Input placeholder="Enter height" />

        <Label>Auto Height</Label>
        <Toggle />
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