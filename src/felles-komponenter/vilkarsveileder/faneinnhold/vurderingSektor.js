import React from 'react';
import * as Nav from '../../../utils/navFrontend';

import '../komponenter/stegIkon.css';

function VurderingSektor() {
  return (
    <div>
      <Nav.Undertittel>Vurdering:</Nav.Undertittel>
      <Nav.Fieldset legend="Gjelder én eller flere av disse for søkeren?">
        <Nav.Checkbox id="steg1_ansatt_offentlig" label="Offentlig tjenesteperson (relevant for 11.3 b)" />
        <Nav.Checkbox id="steg1_ansatt_skip" label="Ansatt på skip (relevant for 11.4" />
        <Nav.Checkbox id="steg1_ansatt_sokkel" label="Ansatt på sokkel (relevant for 11.3 a)" />
        <Nav.Checkbox id="steg1_ansatt_flyvende" label="Flyvende personell (relevant for 11.5)" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={() => this.bekreftOgFortsett()}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
}

VurderingSektor.propTypes = {

};

VurderingSektor.defaultProps = {

};

export default VurderingSektor;
