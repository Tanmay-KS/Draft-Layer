"use client";

import styled from "@emotion/styled";
import React from "react";
import { colors, radius, transitions } from "../../../styles/tokens";

interface ToggleProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
`;

const HiddenCheckbox = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const Slider = styled.span`
  position: absolute;
  inset: 0;
  background-color: ${colors.neutral[300]};
  border-radius: ${radius.pill};
  transition: ${transitions.normal};

  &:before {
    content: "";
    position: absolute;
    height: 16px;
    width: 16px;
    left: 2px;
    top: 2px;
    background-color: white;
    border-radius: ${radius.pill};
    transition: ${transitions.normal};
  }
`;

const StyledCheckbox = styled(HiddenCheckbox)`
  &:checked + ${Slider} {
    background-color: ${colors.primary};
  }

  &:checked + ${Slider}::before {
    transform: translateX(20px);
  }
`;

export const Toggle: React.FC<ToggleProps> = ({ ...props }) => {
  return (
    <Switch>
      <StyledCheckbox type="checkbox" {...props} />
      <Slider />
    </Switch>
  );
};