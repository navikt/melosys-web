import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingSektor = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value="offentlig" label="Offentlig tjenesteperson (relevant for 11.3 b)" />
        <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value="skip" label="Ansatt på skip (relevant for 11.4" />
        <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value="sokkel" label="Ansatt på sokkel (relevant for 11.3 a)" />
        <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value="flyvende" label="Flyvende personell (relevant for 11.5)" />
        <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value="ingenAvDisse" label="Ingen av disse" />
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
