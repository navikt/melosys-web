import React from "react";
import PT from "prop-types";
import Topplinje from "./komponenter/topplinje";

function Hovedside({ children }) {
  return (
    <div>
      <Topplinje />
      {children}
    </div>
  );
}

Hovedside.defaultProps = {
  children: null,
};

Hovedside.propTypes = {
  children: PT.node,
};

Hovedside.defaultProps = {
  children: undefined,
};

export default Hovedside;
