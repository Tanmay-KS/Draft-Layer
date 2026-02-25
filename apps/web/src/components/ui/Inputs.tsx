"use client";

import styled from "@emotion/styled";
import React from "react";
import { spacing, radius, colors, transitions } from "../../../styles/tokens";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const StyledInput = styled.input`
  width: 100%;
  padding: ${spacing.sm};
  border-radius: ${radius.sm};
  border: 1px solid ${colors.neutral[300]};
  background: white;
  outline: none;

  transition:
    border 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    opacity 160ms ease;

  /* Focus State */
  &:focus {
    border: 1px solid ${colors.primary};
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
  }

  /* Hover State */
  &:hover {
    border-color: ${colors.neutral[400] || colors.neutral[300]};
  }

  /* Disabled Visual State */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Number input guardrail (no arrows jitter) */
  &[type="number"] {
    appearance: textfield;
  }

  &[type="number"]::-webkit-outer-spin-button,
  &[type="number"]::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
  }
`;

export const Input: React.FC<InputProps> = ({ ...props }) => {
  return <StyledInput {...props} />;
};