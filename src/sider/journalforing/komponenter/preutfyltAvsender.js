import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

import './avsendervelger.css';

const PreutfyltAvsender = ({
  className,
  avsenderID,
  avsenderNavn,
}) => (
  <div className={className}>
    <Nav.typo.Element className="linje">Avsender ID</Nav.typo.Element>
    <Nav.typo.Normaltekst className="linje">{avsenderID}</Nav.typo.Normaltekst>
    <Nav.typo.Element className="linje">Avsenders navn</Nav.typo.Element>
    <Nav.typo.Normaltekst className="linje">{avsenderNavn}</Nav.typo.Normaltekst>
  </div>
);

PreutfyltAvsender.propTypes = {
  className: PT.string.isRequired,
  avsenderID: PT.string.isRequired,
  avsenderNavn: PT.string.isRequired,
};
export default PreutfyltAvsender;
