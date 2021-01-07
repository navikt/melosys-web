import React from "react";
import PT from "prop-types";

import Rammeverk from "./sider/rammeverk";

export function App({ children }) {
  return (
    <div className="App">
      <Rammeverk>{children}</Rammeverk>
    </div>
  );
}

App.propTypes = {
  children: PT.node,
};

App.defaultProps = {
  children: undefined,
};

export default App;
