import React from 'react';
import PT from 'prop-types';
import Topplinje from '../components/Topplinje';
import './rammeverk.css';
function Rammeverk({children}) {
  return (
    <div className="hovedside">
      <Topplinje/>
      <div className="main-container">
      {children}
      </div>
    </div>
  );
}


Rammeverk.defaultProps = {
  children: null,
  routes: null,
};

Rammeverk.propTypes = {
  children: PT.node,
};

Rammeverk.defaultProps = {
  children: undefined,
};

export default Rammeverk;