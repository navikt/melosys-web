import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

import './vurderingVedtak.css';

const VurderingInngang = props => {
  const { bekreftOgFortsett, inngangsvilkar } = props;
  const { vurdering = '' } = inngangsvilkar;

  return (
    <div className="inngang vedtak">
      <Nav.Fieldset legend="Inngangsvilkår">
        <ul className="betingelser__liste">
          <li className="liste__element liste__element--oppfylt">
            { vurdering }
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
  inngangsvilkar: PT.object.isRequired,
};

export default VurderingInngang;
