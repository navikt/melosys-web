import * as PT from "prop-types";
import classNames from "classnames";
import { Component, ComponentClass, HTMLAttributes } from "react";

const cls = (fluid: boolean | undefined, className: string | undefined) =>
  classNames(className, {
    container: fluid === false,
    "container-fluid": fluid === true,
  });

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  fluid?: boolean;
}

// eslint-disable-next-line react/prefer-stateless-function
class Container extends Component<ContainerProps> {
  render() {
    const { children, className, fluid, ...props } = this.props;
    return (
      <div className={cls(fluid, className)} {...props}>
        {children}
      </div>
    );
  }
}

(Container as ComponentClass).defaultProps = {
  className: undefined,
  children: undefined,
  fluid: false,
};

(Container as ComponentClass).propTypes = {
  className: PT.string,
  fluid: PT.bool,
  children: PT.oneOfType([PT.arrayOf(PT.node), PT.node]),
};

export default Container;
