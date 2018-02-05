import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

export const VurderingTjenestemannTyper = {
  ID: 'OFFENTLIGTJENSTEMANN',
  ETT_LAND: 'ETT_LAND',
  ETT_LAND_YRKESAKTIVITET_ANDRE_LAND: 'ETT_LAND_YRKESAKTIVITET_ANDRE_LAND',
  FLERE_LAND: 'FLERE_LAND',
  FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND: 'FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND',
  IKKE_TJENESTEMANN: 'IKKE_TJENESTEMANN',
};

const VurderingTjenestemann = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Vurder om søker:">
        <Skjema.Radio
          feltNavn="faktaavklaringTjenestemann"
          value={VurderingTjenestemannTyper.ETT_LAND}
          label="Er kun lønnet som tjenestemann, ett land."
        />
        <Skjema.Radio
          feltNavn="faktaavklaringTjenestemann"
          value={VurderingTjenestemannTyper.ETT_LAND_YRKESAKTIVITET_ANDRE_LAND}
          label="Er tjenestemann for ett land, har yrkesaktivitet i andre land."
        />
        <Skjema.Radio
          feltNavn="faktaavklaringTjenestemann"
          value={VurderingTjenestemannTyper.FLERE_LAND}
          label="Er tjenestemann for flere land."
        />
        <Skjema.Radio
          feltNavn="faktaavklaringTjenestemann"
          value={VurderingTjenestemannTyper.FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND}
          label="Er tjenestemann for flere land, har yrkesaktivitet i andre land."
        />
        <Skjema.Radio
          feltNavn="faktaavklaringTjenestemann"
          value={VurderingTjenestemannTyper.IKKE_TJENESTEMANN}
          label="Er ikke tjenestemann."
        />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingTjenestemann.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingTjenestemann;
