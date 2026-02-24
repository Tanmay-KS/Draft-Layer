"use client";

import styled from "@emotion/styled";
import React from "react";
import { colors, spacing } from "../../../styles/tokens";

const Line = styled.hr`
  border: none;
  border-top: 1px solid ${colors.neutral[300]};
  margin: ${spacing.lg} 0;
`;

export const Divider: React.FC = () => {
  return <Line />;
};