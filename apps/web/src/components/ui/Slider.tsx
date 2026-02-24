"use client";

import styled from "@emotion/styled";
import React from "react";
import { colors, transitions } from "../../../styles/tokens";

interface SliderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const StyledSlider = styled.input`
  width: 100%;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: ${colors.neutral[300]};
  outline: none;
  transition: ${transitions.normal};

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
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