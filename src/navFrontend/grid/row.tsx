import * as PT from "prop-types";
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

(Row as ComponentClass).propTypes = {
  className: PT.string,
  children: PT.oneOfType([PT.arrayOf(PT.node), PT.node]),
};

export default Row;
