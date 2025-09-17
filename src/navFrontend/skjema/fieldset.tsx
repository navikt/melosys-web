import { HTMLAttributes, ReactNode } from "react";
import classNames from "classnames";

import bem from "../../bemUtils";

import "./fieldset.less";

interface FieldsetProps extends HTMLAttributes<HTMLFieldSetElement> {
  children: ReactNode | ReactNode[];
  className?: string;
  legend: ReactNode;
}

function Fieldset({ className, children, legend, ...other }: FieldsetProps) {
  const cls = bem("fieldset");

  return (
    <fieldset className={classNames(cls.block, className)} {...other}>
      <legend className={cls.element("legend")}>{legend}</legend>
      {children}
    </fieldset>
  );
}

export default Fieldset;
