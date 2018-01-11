import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingSektor = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        <Skjema.Radio feltNavn="faktaavklaringSektor" value="ansattOffentlig" label="Offentlig tjenesteperson (relevant for 11.3 b)" />
        <Skjema.Radio feltNavn="faktaavklaringSektor" value="ansattSokkel" label="Ansatt på skip (relevant for 11.4" />
        <Skjema.Radio feltNavn="faktaavklaringSektor" value="ansattSkip" label="Ansatt på sokkel (relevant for 11.3 a)" />
        <Skjema.Radio feltNavn="faktaavklaringSektor" value="ansattFlyvende" label="Flyvende personell (relevant for 11.5)" />
        <Skjema.Radio feltNavn="faktaavklaringSektor" value="ansattIngen" label="Ingen av disse" />
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
