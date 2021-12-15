import React, { useEffect } from "react";
import PT from "prop-types";

import MKV from "../../../melosyskodeverk";

import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import * as Mui from "../../../felleskomponenter/ui";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartfakta,
  konverterTilleggBestemmelseTilStegData,
  lagTilleggBestemmelse,
  slettTilleggBestemmelse,
  lagVilkaar,
  slettVilkar,
} from "../../../felleskomponenter/stegvelger";
import { hentFaktaVerdi } from "../../../domeneUtils/avklartefakta";
import { finnTilleggBestemmelse } from "../../../domeneUtils/tilleggbestemmelser";
import { BOOLSK } from "../../../constants";

const stegetsTilleggbestemmelser = [
  {
    kode: MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
    label: MKV.Terms.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
  },
];

const VurderingYrkesgruppe = (props) => {
  const { bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettData, tilbake } = props;
  const { harAvklaring, yrkesgruppe, tilleggbestemmelse } = tilstand;

  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.YRKESGRUPPE, yrkesgruppe));

    const tilleggBestemmelseFunnet = finnTilleggBestemmelse(tilleggbestemmelse, stegetsTilleggbestemmelser);
    if (tilleggBestemmelseFunnet) oppdaterData(konverterTilleggBestemmelseTilStegData(tilleggbestemmelse));
    const cleanup = () => {
      slettData();
    };
    return cleanup;
  }, []);

  const radioEndret = (event) => {
    const yrkessituasjon = event.target.value;

    oppdaterData(lagAvklartfakta(KV.Koder.YRKESGRUPPE, null, yrkessituasjon));

    if (yrkessituasjon === KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL) {
      oppdaterData(
        lagTilleggBestemmelse(MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5)
      );
    } else {
      slettData(slettTilleggBestemmelse());
    }

    if (yrkessituasjon === KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12) {
      oppdaterData(lagVilkaar("art16_1_anmodning", true));
    } else {
      slettData(slettVilkar("art16_1_anmodning"));
    }
  };

  const fakta = hentFaktaVerdi(yrkesgruppe);
  return (
    <div>
      <Nav.Typo.Undertittel>Hva er søkerens yrkessituasjon?</Nav.Typo.Undertittel>
      <Nav.Fieldset legend="">
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.ORDINAER}
          value={KV.Koder.VurderingYrkesgruppeTyper.ORDINAER}
          onChange={radioEndret}
          label="Yrkesaktiv"
        />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP}
          value={KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP}
          onChange={radioEndret}
          label="Yrkesaktiv på sokkel eller skip"
        />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL}
          value={KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL}
          onChange={radioEndret}
          label="Yrkesaktiv, som flygende personell"
        />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12}
          value={KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12}
          onChange={radioEndret}
          label="Yrkesaktiv, direkte til vurdering av artikkel 16"
        />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={BOOLSK.SANN}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.IKKE_YRKESAKTIV}
          value={KV.Koder.VurderingYrkesgruppeTyper.IKKE_YRKESAKTIV}
          onChange={radioEndret}
          label="Ikke yrkesaktiv"
        />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={BOOLSK.SANN}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.KONTANTYTELSESMOTTAKER}
          value={KV.Koder.VurderingYrkesgruppeTyper.KONTANTYTELSESMOTTAKER}
          onChange={radioEndret}
          label="Kontantytelsesmottaker"
        />
      </Nav.Fieldset>
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          "data-cy-nesteknapp": "knapp_steg1",
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </div>
  );
};

VurderingYrkesgruppe.ID = "YRKESGRUPPE";

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
  tilbake: PT.func.isRequired,
};

export default VurderingYrkesgruppe;
