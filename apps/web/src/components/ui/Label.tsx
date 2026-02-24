"use client";

import styled from "@emotion/styled";
import React from "react";
import { fontSize, colors } from "../../styles/tokens";
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  muted?: boolean;
}

const StyledLabel = styled.label<{ muted?: boolean }>`
  font-size: ${fontSize.sm};
  color: ${({ muted }) =>
    muted ? colors.neutral[500] : colors.neutral[800]};
`;

export const Label: React.FC<LabelProps> = ({
  muted = false,
  children,
  ...props
}) => {
  return (
    <StyledLabel muted={muted} {...props}>
      {children}
    </StyledLabel>
  );
};