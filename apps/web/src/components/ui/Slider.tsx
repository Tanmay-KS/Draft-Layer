"use client";

import styled from "@emotion/styled";
import React from "react";
import { colors } from "../../../styles/tokens";

interface SliderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const StyledSlider = styled.input`
  width: 100%;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: ${colors.neutral[300]};
  outline: none;
  cursor: pointer;

  transition: background 160ms ease, opacity 160ms ease;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    cursor: grabbing;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
    transition: transform 120ms ease;
  }

  &::-webkit-slider-thumb:active {
    transform: scale(1.1);
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
  }
`;

export const Slider: React.FC<SliderProps> = ({ ...props }) => {
  return <StyledSlider type="range" {...props} />;
};