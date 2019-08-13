import React from 'react';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as KV from '../kodeverk';

import './begrunnelser.css';

const Begrunnelser = ({
  label,
  valgteBegrunnelser,
  muligeBegrunnelser,
  fritekst,
}) => (
  <div className="begrunnelser">
    <Nav.Element className="begrunnelseTittel">
      {label}
    </Nav.Element>
    {
      valgteBegrunnelser.map(begrunnelse => <div className="begrunnelse" key={begrunnelse}>{KV.kodeTilTerm(begrunnelse, muligeBegrunnelser)}</div>)
    }
    {
      fritekst && <div className="begrunnelse">{fritekst}</div>
    }
  </div>
);

Begrunnelser.propTypes = {
  label: PT.string.isRequired,
  valgteBegrunnelser: PT.array.isRequired,
  muligeBegrunnelser: PT.array.isRequired,
  fritekst: PT.string,
};

Begrunnelser.defaultProps = {
  fritekst: '',
};

export default Begrunnelser;
