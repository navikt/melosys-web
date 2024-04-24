import { useEffect } from "react";
import PT from "prop-types";

import MKV, { MKVUtils } from "../../../melosyskodeverk";

import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import * as Mui from "../../../felleskomponenter/ui";
import {
  konverterAvklartfaktaTilStegData,
  konverterTilleggBestemmelseTilStegData,
  lagAvklartfakta,
  lagLovvalgsbestemmelse,
  lagTilleggBestemmelse,
  lagVilkaar,
  slettLovvalgsbestemmelse,
  slettTilleggBestemmelse,
  slettVilkar,
} from "../../../felleskomponenter/stegvelger";
import { finnTilleggBestemmelse, hentFaktaVerdi } from "../../../domeneUtils";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../featuretoggle/toggleNavn";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { useSelector } from "react-redux";
import { formSelectors } from "../../../ducks/form";

const stegetsTilleggbestemmelser = [
  {
    kode: MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
    label: MKV.Terms.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
  },
];
const { lovvalgbestemmelser_konv_efta_storbritannia } = MKV.KTObjects.lovvalgsbestemmelser;
const { lovvalgbestemmelser_883_2004 } = MKV.KTObjects.lovvalgsbestemmelser;

const { KONV_EFTA_STORBRITANNIA_ART18_1 } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia;
const { FO_883_2004_ART16_1 } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004;
const VurderingYrkesgruppe = (props) => {
  const { bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettData, tilbake } = props;
  const { harAvklaring, yrkesgruppe, tilleggbestemmelse } = tilstand;
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const soknadsform = useSelector(formSelectors.SoknadFormValuesSelector);
  const konvensjonEftaLandOgStorbritanniaToggleEnabled = useFeatureToggle(
    MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA
  );

  const enesteLandErStorbritania = MKVUtils.enesteLandErStorbritannia(soknadsform?.soknadsland.landkoder);
  const fakta = hentFaktaVerdi(yrkesgruppe);

  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.YRKESGRUPPE, yrkesgruppe));

    const tilleggBestemmelseFunnet = finnTilleggBestemmelse(tilleggbestemmelse, stegetsTilleggbestemmelser);
    if (tilleggBestemmelseFunnet) oppdaterData(konverterTilleggBestemmelseTilStegData(tilleggbestemmelse));
    return () => {
      slettData();
    };
  }, []);

  useEffect(() => {
    if (!enesteLandErStorbritania && fakta === KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12) {
      oppdaterData(lagLovvalgsbestemmelse(FO_883_2004_ART16_1));
    } else {
      slettData(slettLovvalgsbestemmelse(FO_883_2004_ART16_1));
    }
  }, [enesteLandErStorbritania, fakta]);

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

  const hentBestemmelser = () => {
    if (enesteLandErStorbritania) {
      return [
        KV.kodeTilObjekt(KONV_EFTA_STORBRITANNIA_ART18_1, lovvalgbestemmelser_konv_efta_storbritannia),
        KV.kodeTilObjekt(FO_883_2004_ART16_1, lovvalgbestemmelser_883_2004),
      ];
    }
    return [KV.kodeTilObjekt(FO_883_2004_ART16_1, lovvalgbestemmelser_883_2004)];
  };

  return (
    <div>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Hva er søkerens yrkessituasjon?</Nav.Typo.Innholdstittel>
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
          label={
            konvensjonEftaLandOgStorbritanniaToggleEnabled
              ? "Yrkesaktiv, direkte til vurdering av anmodning om unntak"
              : "Yrkesaktiv, direkte til vurdering av artikkel 16"
          }
        />

        {!(konvensjonEftaLandOgStorbritanniaToggleEnabled && MKVUtils.erUtsendt(behandlingstema)) && (
          <>
            <Nav.Radio
              name="yrkesgruppe"
              disabled
              checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.IKKE_YRKESAKTIV}
              value={KV.Koder.VurderingYrkesgruppeTyper.IKKE_YRKESAKTIV}
              onChange={radioEndret}
              label="Ikke yrkesaktiv"
            />
            <Nav.Radio
              name="yrkesgruppe"
              disabled
              checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.KONTANTYTELSESMOTTAKER}
              value={KV.Koder.VurderingYrkesgruppeTyper.KONTANTYTELSESMOTTAKER}
              onChange={radioEndret}
              label="Kontantytelsesmottaker"
            />
          </>
        )}
        {konvensjonEftaLandOgStorbritanniaToggleEnabled &&
          fakta === KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12 && (
            <Mui.ListevelgerFlervalg
              muligeValg={hentBestemmelser()}
              label="Velg bestemmelse"
              tillatFritekst={false}
              onChange={(a) => {
                console.log("koder", { a });
              }}
              placeholder={
                !enesteLandErStorbritania && KV.kodeTilObjekt(FO_883_2004_ART16_1, lovvalgbestemmelser_883_2004).term
              }
              disabled={!redigerbart || !enesteLandErStorbritania}
            />
          )}
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
