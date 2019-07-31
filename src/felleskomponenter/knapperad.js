import React from 'react';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';

import './knapperad.css';

const Knapperad = ({
  bekreft, bekreftTekst, avbryt, avbrytTekst, redigerbart,
}) => (
  <div className="container__knapperad">
    <Nav.Hovedknapp onClick={bekreft} disabled={!redigerbart}>{ bekreftTekst }</Nav.Hovedknapp>
    <Nav.Knapp onClick={avbryt} disabled={!redigerbart}>{avbrytTekst}</Nav.Knapp>
  </div>
);

Knapperad.propTypes = {
  bekreft: PT.func.isRequired,
  bekreftTekst: PT.string.isRequired,
  avbryt: PT.func.isRequired,
  avbrytTekst: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
};

export default Knapperad;
