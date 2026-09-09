import React from "react";
import "./borderedFormContainer.less";

interface BorderedFormContainerProps {
  children: React.ReactNode;
  className?: string;
}
//Mulig denne kan døpes til container, men gjenstår arbeid i årsavregning MED grunnlag først
export function BorderedFormContainer({ children, className = "" }: BorderedFormContainerProps) {
  return <div className={`bordered-form-container ${className}`}>{children}</div>;
}
