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
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error) {
    Utils.logger.error(error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
    });
    Utils.logger.error({ error, stack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h3>{this.props.message}</h3>
        </div>
      );
    }
    return this.props.children;
  }
}
ErrorBoundary.propTypes = {
  message: PT.string.isRequired,
  children: PT.node.isRequired,
};
export default ErrorBoundary;
