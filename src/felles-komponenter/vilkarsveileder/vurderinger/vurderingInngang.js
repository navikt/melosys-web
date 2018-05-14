import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

import './vurderingVedtak.css';

const VurderingInngang = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div className="inngang vedtak">
      <Nav.Fieldset legend="Inngangsvilkår">
        <ul className="betingelser__liste">
          <li className="liste__element liste__element--oppfylt">
            Søknaden oppfyller inngangsvilkårene for EU/EØS-saker, etter forordning 883/2004.
          </li>
        </ul>
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Start behandling</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingInngang.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};


export default VurderingInngang;
