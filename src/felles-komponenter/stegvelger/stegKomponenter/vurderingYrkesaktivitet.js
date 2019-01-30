import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import { VurderingYrkesaktivitetTyper } from '../../../koder';

const VurderingYrkesaktivitet = props => {
  const { bekreftOgFortsett, tilstand, redigerbart } = props;
  const { harAvklaring } = tilstand;

  return (
    <div>
      <Nav.Undertittel>Vurdering av yrkesaktivitet</Nav.Undertittel>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        <Skjema.Radio
          disabled={!redigerbart}
          feltNavn="avklartefakta.yrkesaktivitet"
          value={VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER}
          label="Ordinær arbeidstaker"
        />
        <Skjema.Radio
          disabled={!redigerbart}
          feltNavn="avklartefakta.yrkesaktivitet"
          value={VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE}
          label="Selvstendig næringsdrivende"
        />
        <Skjema.Radio
          disabled={!redigerbart}
          feltNavn="avklartefakta.yrkesaktivitet"
          value={VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG}
          label="Ordinær arbeidstaker og selvstendig næringsdrivende"
        />
        <Skjema.Radio
          disabled={!redigerbart}
          feltNavn="avklartefakta.yrkesaktivitet"
          value={VurderingYrkesaktivitetTyper.TJENESTEPERSON_NORSK_STATSFORVANTLING}
          label="Tjenesteperson i norsk statsforvaltning"
        />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingYrkesaktivitet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  redigerbart: PT.bool.isRequired,
};

VurderingYrkesaktivitet.defaultProps = {
  tilstand: {},
};

export default VurderingYrkesaktivitet;
