"use client";

import styled from "@emotion/styled";
import React from "react";
import { spacing, radius, colors, transitions } from "../../styles/tokens.ts";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const StyledButton = styled.button<{ variant: "primary" | "secondary" }>`
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${radius.md};
  border: none;
  cursor: pointer;
  transition: ${transitions.normal};

  background-color: ${({ variant }) =>
    variant === "primary" ? colors.primary : colors.neutral[300]};

  color: ${({ variant }) =>
    variant === "primary" ? "#ffffff" : colors.neutral[800]};
`;

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  ...props
}) => {
  return (
    <StyledButton variant={variant} {...props}>
      {children}
    </StyledButton>
  );
};