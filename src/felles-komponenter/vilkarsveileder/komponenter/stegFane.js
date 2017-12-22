import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import * as Nav from '../../../utils/navFrontend';

import './stegFane.css';

const StegFane = props => {
  const { children, stegNummer, aktivtSteg } = props;

  const stegFaneKlasse = classnames({ stegFane: true, [`steg${stegNummer}`]: true, 'stegFane--aktiv': aktivtSteg === stegNummer });

  return (
    <Nav.Panel className={stegFaneKlasse}>
      {children}
    </Nav.Panel>
  );
};

StegFane.propTypes = {
  children: PT.any.isRequired,
  aktivtSteg: PT.number.isRequired,
  stegNummer: PT.number.isRequired,
};

export default StegFane;
