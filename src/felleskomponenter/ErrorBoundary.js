import React from 'react';
import PT from 'prop-types';
import * as Utils from '../utils';
/*
* Error Boundary
* https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html
* https://medium.com/@wlodarczyk_j/componentdidcatch-and-error-boundary-new-way-of-handling-errors-in-react-16-eecd4009c95e
*/

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    Utils.logger.error(error);
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    window.frontendlogger.error({ error, stack: errorInfo.componentStack });
  }

  resetErrorBoundary = () => {
    this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    const { fallbackRender, message, children } = this.props;

    if (error !== null) {
      if (fallbackRender !== null) {
        return fallbackRender({ error: error.body, resetErrorBoundary: this.resetErrorBoundary });
      }

      return (
        <div>
          <h3>{message}</h3>
        </div>
      );
    }
    return children;
  }
}
ErrorBoundary.propTypes = {
  message: PT.string,
  children: PT.node.isRequired,
  fallbackRender: PT.func,
};

ErrorBoundary.defaultProps = {
  fallbackRender: null,
  message: null,
};

export default ErrorBoundary;
