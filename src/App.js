import React from "react";
import PT from "prop-types";
import Rammeverk from "./sider/rammeverk";

export function App({ loadInitialData, children }) {
  return (
    <div className="App">
      <Rammeverk loadInitialData={loadInitialData}>{children}</Rammeverk>
    </div>
  );
}

App.propTypes = {
  children: PT.node,
  loadInitialData: PT.func,
};

App.defaultProps = {
  children: undefined,
  loadInitialData: () => {},
};

export default App;
