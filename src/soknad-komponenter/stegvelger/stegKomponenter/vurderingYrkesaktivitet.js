import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as KV from '../../../kodeverk';
import { lagAvklartfakta } from '../../../regler/avklartefakta';

const VurderingYrkesaktivitet = props => {
  const { bekreftOgFortsett, tilstand, redigerbart } = props;
  const { harAvklaring } = tilstand;

  const radioEndret = event => {
    const { oppdaterData } = this.props;
    oppdaterData(lagAvklartfakta(KV.Koder.YRKESAKTIVITET, event.target.value));
  };

  return (
    <div>
      <Nav.Undertittel>Vurdering av yrkesaktivitet</Nav.Undertittel>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        <Skjema.Radio
          disabled={!redigerbart}
          feltNavn="avklartefakta.yrkesaktivitet"
          value={KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER}
          onChange={radioEndret}
          label="Arbeidstaker eller frilanser"

        />
        <Skjema.Radio
          disabled={!redigerbart}
          feltNavn="avklartefakta.yrkesaktivitet"
          value={KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE}
          onChange={radioEndret}
          label="Selvstendig næringsdrivende"
        />
        <Skjema.Radio
          disabled={!redigerbart}
          feltNavn="avklartefakta.yrkesaktivitet"
          value={KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG}
          onChange={radioEndret}
          label="Arbeidstaker eller frilanser og selvstendig næringsdrivende"
        />
        <Skjema.Radio
          disabled={!redigerbart}
          feltNavn="avklartefakta.yrkesaktivitet"
          value={KV.Koder.VurderingYrkesaktivitetTyper.TJENESTEPERSON_NORSK_STATSFORVANTLING}
          onChange={radioEndret}
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
  oppdaterData: PT.func.isRequired,
};

VurderingYrkesaktivitet.defaultProps = {
  tilstand: {},
};

export default VurderingYrkesaktivitet;
