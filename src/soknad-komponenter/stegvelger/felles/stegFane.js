import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import * as Nav from '../../../utils/navFrontend';

import './stegFane.css';

const StegFane = props => {
  const { faneData } = props;
  const componentProps = { ...faneData.data, ...faneData.handlers };
  const stegFaneKlasse = classnames({ stegFane: true, [`steg${faneData.stegPosisjon}`]: true, 'stegFane--aktiv': faneData.aktivtSteg });
  return (
    <Nav.Panel className={stegFaneKlasse}>
      <div>{React.createElement(faneData.komponent, componentProps)}</div>
    </Nav.Panel>
  );
};

StegFane.propTypes = {
  faneData: PT.object.isRequired,
};

export default StegFane;
