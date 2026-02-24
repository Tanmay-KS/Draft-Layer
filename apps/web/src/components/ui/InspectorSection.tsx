"use client";

import styled from "@emotion/styled";
import React, { useState } from "react";
import { spacing, colors, transitions } from "../../../styles/tokens";

interface InspectorSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Container = styled.div`
  border-bottom: 1px solid ${colors.neutral[300]};
  padding: ${spacing.md} 0;
`;

const Header = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: ${spacing.sm} 0;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: ${transitions.fast};
`;

const Content = styled.div<{ open: boolean }>`
  margin-top: ${spacing.sm};
  display: ${({ open }) => (open ? "block" : "none")};
`;

export const InspectorSection: React.FC<InspectorSectionProps> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Container>
      <Header onClick={() => setOpen(!open)}>
        {title}
        <span>{open ? "−" : "+"}</span>
      </Header>
      <Content open={open}>{children}</Content>
    </Container>
  );
};