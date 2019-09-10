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
      error: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    Utils.logger.error(error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({
      error,
      hasError: true,
    });
    Utils.logger.error({ error, stack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <div>Beklager, kan ikke laste inn side komponenten. {this.state.error}</div>;
    }
    return this.props.children;
  }
}
ErrorBoundary.propTypes = {
  children: PT.node.isRequired,
};
export default ErrorBoundary;
