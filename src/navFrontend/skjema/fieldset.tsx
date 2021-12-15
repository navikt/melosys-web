import React, { HTMLAttributes } from "react";
import classNames from "classnames";

import bem from "../../bemUtils";

import "./fieldset.css";

// Fieldset ble fjernet fra nav-frontend, så vi implementerer den her, slik at vi slipper å refaktorere alle steder som bruker Nav.Fieldset.

interface FieldsetProps extends HTMLAttributes<HTMLFieldSetElement> {
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  legend: React.ReactNode;
}

const Fieldset = ({ className, children, legend, ...other }: FieldsetProps) => {
  const cls = bem("fieldset");

  return (
    <fieldset className={classNames(cls.block, className)} {...other}>
      <legend className={cls.element("legend")}>{legend}</legend>
      {children}
    </fieldset>
  );
};

export default Fieldset;
