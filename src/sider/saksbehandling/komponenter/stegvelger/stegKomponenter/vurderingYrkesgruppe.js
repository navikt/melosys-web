import React, { useEffect } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as KV from '../../../../../kodeverk';
import { hentFaktaVerdi, konverterTilStegData, lagAvklartfakta } from '../../../../../regler/avklartefakta';
import {
  finnTilleggBestemmelse,
  konverterTilleggBestemmelseTilStegData,
  lagTilleggBestemmelse,
  slettTilleggBestemmelse,
} from '../../../../../regler/tilleggbestemmelser';
import { lagVilkaar, slettVilkar } from '../../../../../regler/vilkar';
import { BOOLSK } from '../../../../../constants';

const stegetsTilleggbestemmelser = [
  {
    kode: MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
    label: MKV.Terms.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
  },
];

const VurderingYrkesgruppe = props => {
  const {
    bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettData,
  } = props;
  const { harAvklaring, yrkesgruppe, tilleggbestemmelse } = tilstand;

  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.YRKESGRUPPE, yrkesgruppe));

    const tilleggBestemmelseFunnet = finnTilleggBestemmelse(tilleggbestemmelse, stegetsTilleggbestemmelser);
    if (tilleggBestemmelseFunnet) oppdaterData(konverterTilleggBestemmelseTilStegData(tilleggbestemmelse));
    const cleanup = () => {
      slettData();
    };
    return cleanup;
  }, []);

  const radioEndret = event => {
    const yrkessituasjon = event.target.value;

    oppdaterData(lagAvklartfakta(KV.Koder.YRKESGRUPPE, null, yrkessituasjon));

    if (yrkessituasjon === KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL) {
      oppdaterData(lagTilleggBestemmelse(MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5));
    } else {
      slettData(slettTilleggBestemmelse());
    }

    if (yrkessituasjon === KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12) {
      oppdaterData(lagVilkaar('art16_1_anmodning', true));
    } else {
      slettData(slettVilkar('art16_1_anmodning'));
    }
  };

  const fakta = hentFaktaVerdi(yrkesgruppe);
  return (
    <div>
      <Nav.Undertittel>Hva er søkerens yrkessituasjon?</Nav.Undertittel>
      <Nav.Fieldset legend="">
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.ORDINAER}
          value={KV.Koder.VurderingYrkesgruppeTyper.ORDINAER}
          onChange={radioEndret}
          label="Yrkesaktiv" />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP}
          value={KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP}
          onChange={radioEndret}
          label="Yrkesaktiv på sokkel eller skip" />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL}
          value={KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL}
          onChange={radioEndret}
          label="Yrkesaktiv, som flygende personell" />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12}
          value={KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12}
          onChange={radioEndret}
          label="Yrkesaktiv, direkte til vurdering av artikkel 16" />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={BOOLSK.SANN}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.IKKE_YRKESAKTIV}
          value={KV.Koder.VurderingYrkesgruppeTyper.IKKE_YRKESAKTIV}
          onChange={radioEndret}
          label="Ikke yrkesaktiv" />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={BOOLSK.SANN}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.KONTANTYTELSESMOTTAKER}
          value={KV.Koder.VurderingYrkesgruppeTyper.KONTANTYTELSESMOTTAKER}
          onChange={radioEndret}
          label="Kontantytelsesmottaker" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingYrkesgruppe.ID = 'YRKESGRUPPE';


VurderingYrkesgruppe.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.shape({
    marginaltArbeid: PT.array,
    tilleggbestemmelse: PT.string,
    harAvklaring: PT.bool,
    yrkesgruppe: PT.object.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

export default VurderingYrkesgruppe;
