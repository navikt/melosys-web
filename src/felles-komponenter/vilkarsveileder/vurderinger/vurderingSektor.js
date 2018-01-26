import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

export const VurderingSektorTyper = {
  ID: 'SEKTOR',
  OFFENTLIG: 'OFFENTLIG',
  SKIP: 'SKIP',
  SOKKEL: 'SOKKEL',
  FLYVENDE: 'FLYVENDE',
  INGEN_AV_DISSE: 'INGEN_AV_DISSE',
};

const AnsattISektor = () => (
  <Nav.Fieldset legend="Hva gjelder for søkeren?">
    <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value={VurderingSektorTyper.OFFENTLIG} label="Offentlig tjenesteperson (relevant for 11.3 b)" />
    <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value={VurderingSektorTyper.SKIP} label="Ansatt på skip (relevant for 11.4)" />
    <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value={VurderingSektorTyper.SOKKEL} label="Ansatt på sokkel (relevant for 11.3 a)" />
    <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value={VurderingSektorTyper.FLYVENDE} label="Flyvende personell (relevant for 11.5)" />
    <Skjema.Radio feltNavn="faktaavklaringAnsattISektor" value={VurderingSektorTyper.INGEN_AV_DISSE} label="Ingen av disse" />
  </Nav.Fieldset>
);

const VurderingSektor = props => {
  const { bekreftOgFortsett, tilstand } = props;

  return (
    <div>
      { tilstand.visAnsattISektor && AnsattISektor }
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingSektor.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingSektor.defaultProps = {
  tilstand: {},
};

export default VurderingSektor;
