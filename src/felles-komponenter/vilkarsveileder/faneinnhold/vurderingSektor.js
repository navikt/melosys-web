import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

const VurderingSektor = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        <Nav.Radio name="ansatt-sektor" id="steg1_ansatt_offentlig" label="Offentlig tjenesteperson (relevant for 11.3 b)" />
        <Nav.Radio name="ansatt-sektor" id="steg1_ansatt_skip" label="Ansatt på skip (relevant for 11.4" />
        <Nav.Radio name="ansatt-sektor" id="steg1_ansatt_sokkel" label="Ansatt på sokkel (relevant for 11.3 a)" />
        <Nav.Radio name="ansatt-sektor" id="steg1_ansatt_flyvende" label="Flyvende personell (relevant for 11.5)" />
        <Nav.Radio name="ansatt-sektor" id="steg1_ansatt_ingen" label="Ingen av disse" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingSektor.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingSektor;
