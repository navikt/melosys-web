import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as KV from '../../../kodeverk';

const VurderingTjenestemann = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Vurder om søker:">
        <Skjema.Radio
          feltNavn="avklartefaktaTjenestemann"
          value={KV.Koder.VurderingTjenestemannTyper.ETT_LAND}
          label="Er kun lønnet som tjenesteperson, ett land."
        />
        <Skjema.Radio
          feltNavn="avklartefaktaTjenestemann"
          value={KV.Koder.VurderingTjenestemannTyper.ETT_LAND_YRKESAKTIVITET_ANDRE_LAND}
          label="Er tjenesteperson i Norge, har yrkesaktivitet i andre land."
        />
        <Skjema.Radio
          feltNavn="avklartefaktaTjenestemann"
          value={KV.Koder.VurderingTjenestemannTyper.IKKE_TJENESTEMANN}
          label="Er ikke tjenesteperson."
        />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingTjenestemann.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingTjenestemann;
