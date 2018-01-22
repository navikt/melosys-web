import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingSektor = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value={VurderingSektor.OFFENTLIG} label="Offentlig tjenesteperson (relevant for 11.3 b)" />
        <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value={VurderingSektor.SKIP} label="Ansatt på skip (relevant for 11.4)" />
        <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value={VurderingSektor.SOKKEL} label="Ansatt på sokkel (relevant for 11.3 a)" />
        <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value={VurderingSektor.FLYVENDE} label="Flyvende personell (relevant for 11.5)" />
        <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value={VurderingSektor.INGEN_AV_DISSE} label="Ingen av disse" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingSektor.ID = 'SEKTOR';
VurderingSektor.OFFENTLIG = 'OFFENTLIG';
VurderingSektor.SKIP = 'SKIP';
VurderingSektor.SOKKEL = 'SOKKEL';
VurderingSektor.FLYVENDE = 'FLYVENDE';
VurderingSektor.INGEN_AV_DISSE = 'INGEN_AV_DISSE';

VurderingSektor.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingSektor;
