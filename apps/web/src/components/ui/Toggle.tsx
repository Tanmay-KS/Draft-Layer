"use client";

import styled from "@emotion/styled";
import React from "react";
import { colors, radius } from "../../styles/tokens";

interface ToggleProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  cursor: pointer;
`;

const HiddenCheckbox = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:focus + span {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const SliderTrack = styled.span<{ checked?: boolean }>`
  position: absolute;
  inset: 0;
  background-color: ${({ checked }) =>
    checked ? colors.primary : colors.neutral[300]};
  border-radius: ${radius.pill};
  transition: background-color 160ms ease;

  display: flex;
  align-items: center;
  padding: 2px;

  &::before {
    content: "";
    height: 16px;
    width: 16px;
    background: white;
    border-radius: ${radius.pill};
    transform: ${({ checked }) =>
      checked ? "translateX(20px)" : "translateX(0)"};
    transition: transform 160ms ease;
  }
`;

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  ...props
}) => {
  return (
    <Switch>
      <HiddenCheckbox type="checkbox" checked={checked} {...props} />
      <SliderTrack checked={checked} />
    </Switch>
  );
};