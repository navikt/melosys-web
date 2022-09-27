import React from "react";
import PT from "prop-types";
import Topplinje from "./komponenter/topplinje";

function Hovedside({ loadInitialData, children }) {
  loadInitialData();

  return (
    <div>
      <Topplinje />
      {children}
    </div>
  );
}

Hovedside.defaultProps = {
  children: null,
  loadInitialData: () => {},
};

Hovedside.propTypes = {
  children: PT.node,
  loadInitialData: PT.func,
};

Hovedside.defaultProps = {
  children: undefined,
  loadInitialData: () => {},
};

export default Hovedside;
