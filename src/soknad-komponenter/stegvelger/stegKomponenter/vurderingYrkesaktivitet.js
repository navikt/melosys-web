import React, { useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import { hentFaktaVerdi, konverterTilStegData, lagAvklartfakta } from '../../../regler/avklartefakta';
import { BOOLSK } from '../../../constants';

const VurderingYrkesaktivitet = props => {
  const {
    bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettData,
  } = props;
  const { harAvklaring, yrkesaktivitet } = tilstand;

  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.YRKESAKTIVITET, yrkesaktivitet));
    return function cleanup() {
      slettData();
    };
  }, []);

  const radioEndret = event => {
    oppdaterData(lagAvklartfakta(KV.Koder.YRKESAKTIVITET, null, event.target.value));
  };

  const fakta = hentFaktaVerdi(yrkesaktivitet);
  return (
    <div>
      <Nav.Undertittel>Vurdering av yrkesaktivitet</Nav.Undertittel>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        <Nav.Radio
          name="yrkesaktivitet"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER}
          value={KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER}
          onChange={radioEndret}
          label="Arbeidstaker eller frilanser"
        />
        <Nav.Radio
          name="yrkesaktivitet"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE}
          value={KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE}
          onChange={radioEndret}
          label="Selvstendig næringsdrivende"
        />
        <Nav.Radio
          name="yrkesaktivitet"
          disabled={BOOLSK.SANN}
          checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG}
          value={KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG}
          onChange={radioEndret}
          label="Arbeidstaker eller frilanser og selvstendig næringsdrivende"
        />
        <Nav.Radio
          name="yrkesaktivitet"
          disabled={BOOLSK.SANN}
          checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.TJENESTEPERSON_NORSK_STATSFORVANTLING}
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
  slettData: PT.func.isRequired,
};

VurderingYrkesaktivitet.defaultProps = {
  tilstand: {},
};

export default VurderingYrkesaktivitet;
