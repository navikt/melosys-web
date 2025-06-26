import classNames from "classnames";
import { Component, ComponentClass, HTMLAttributes } from "react";

const cls = (
  className: string | undefined,
  xs: string | undefined,
  sm: string | undefined,
  md: string | undefined,
  lg: string | undefined,
) =>
  classNames("col", className, {
    [`col-xs-${xs}`]: !!xs,
    [`col-sm-${sm}`]: !!sm,
    [`col-md-${md}`]: !!md,
    [`col-lg-${lg}`]: !!lg,
  });

export interface ColumnProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  xs?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
  sm?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
  md?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
  lg?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
}

/**
 * @deprecated Bruk aksel primitives (HGrid, HStack, VStack, Box) i stedet.
 */
class Column extends Component<ColumnProps> {
  render() {
    const { children, className, xs, sm, md, lg, ...props } = this.props;

    return (
      <div className={cls(className, xs, sm, md, lg)} {...props}>
        {children}
      </div>
    );
  }
}

(Column as ComponentClass).defaultProps = {
  className: undefined,
  children: undefined,
  xs: undefined,
  sm: undefined,
  md: undefined,
  lg: undefined,
};

export default Column;
