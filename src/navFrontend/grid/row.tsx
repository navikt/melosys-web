import classNames from "classnames";
import { Component, ComponentClass, HTMLAttributes } from "react";

const cls = (className: string | undefined) => classNames("row", className, {});

export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

class Row extends Component<RowProps> {
  render() {
    const { children, className, ...props } = this.props;

    return (
      <div className={cls(className)} {...props}>
        {children}
      </div>
    );
  }
}

(Row as ComponentClass).defaultProps = {
  className: undefined,
  children: undefined,
};

export default Row;
