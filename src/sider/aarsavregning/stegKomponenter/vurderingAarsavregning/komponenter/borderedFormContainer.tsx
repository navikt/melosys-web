import React from "react";
import "./borderedFormContainer.css";

interface BorderedFormContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function BorderedFormContainer({ children, className = "" }: BorderedFormContainerProps) {
  return <div className={`bordered-form-container ${className}`}>{children}</div>;
}
