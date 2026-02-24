"use client";

import styled from "@emotion/styled";
import React from "react";
import { spacing, radius, colors } from "../../../styles/tokens";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const StyledInput = styled.input`
  width: 100%;
  padding: ${spacing.sm};
  border-radius: ${radius.sm};
  border: 1px solid ${colors.neutral[300]};
`;

export const Input: React.FC<InputProps> = ({ ...props }) => {
  return <StyledInput {...props} />;
};