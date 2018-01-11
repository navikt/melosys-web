import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

const VurderingUtsending = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        <Nav.Checkbox name="ansatt-sektor" id="utsending_annsattinorskselskap" label="Skal personen være ansatt i det norske selskapet i hele utsendingsperioden?" />
        <Nav.Checkbox name="ansatt-sektor" id="utsending_erstatter" label="Skal personen erstatte en annen?" />
        <Nav.Checkbox name="ansatt-sektor" id="utsending_mindreenn24" label="Er utsendingsperioden mindre enn 24 mnd?" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingUtsending.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingUtsending;
