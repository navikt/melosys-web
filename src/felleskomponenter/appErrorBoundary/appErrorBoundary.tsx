import React, { Component, ReactNode } from "react";
import * as Nav from "../../navFrontend";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details to console for debugging
    /* eslint-disable no-console */
    console.error("React Error Boundary caught error:", error);
    console.error("Component stack:", errorInfo.componentStack);
    console.error("Error boundary info:", errorInfo);
    /* eslint-enable no-console */
  }

  resetError = () => {
    this.setState({ hasError: false });
  };

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Nav.Heading level="1">Noe gikk galt</Nav.Heading>
          <p>Beklager, kunne ikke laste inn siden.</p>
          <Nav.Button type="button" onClick={this.resetError}>
            Prøv igjen
          </Nav.Button>
        </div>
      );
    }

    return children;
  }
}

export default AppErrorBoundary;
