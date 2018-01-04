import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

const VurderingVirksomhet = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hvor mange land skal søker arbeide/drive virsomhet i?">
        <Nav.Radio id="steg2_land_ett" name="land" label="Ett" />
        <Nav.Radio id="steg2_land_flere" name="land" label="To eller flere" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Hvor mye av aktiviteten skjer i Norge?">
        <Nav.Radio id="steg2_aktivitet_under25" name="aktivitet" label="Mindre enn 25%" />
        <Nav.Radio id="steg2_aktivitet_over25" name="aktivitet" label="25% eller mer" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Hvor mange arbeidsgivere har søker?">
        <Nav.Radio id="steg2_arbeidsgivere_en" name="arbeidsgivere" label="Èn" />
        <Nav.Radio id="steg2_arbeidsgivere_fler" name="arbeidsgivere" label="To eller fler" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Er arbeidsgivere i samme land eller i ulike land?">
        <Nav.Radio id="steg2_arbeidsgiverfordeling_ettland" name="arbeidsgiverfordeling" label="Samme land" />
        <Nav.Radio id="steg2_arbeidsgiverfordeling_ulikeland" name="arbeidsgiverfordeling" label="Ulike land" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingVirksomhet;
