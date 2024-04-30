import { ChangeEvent, useEffect, useState } from "react";
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
  slettTilleggBestemmelse,
  slettVilkar,
} from "../../../felleskomponenter/stegvelger";
import { finnTilleggBestemmelse, hentFaktaVerdi } from "../../../domeneUtils";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../featuretoggle/toggleNavn";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { useSelector } from "react-redux";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { anmodningsperioderSelectors } from "../../../ducks/anmodningsperioder";

const { lovvalgbestemmelser_konv_efta_storbritannia } = MKV.KTObjects.lovvalgsbestemmelser;
const { lovvalgbestemmelser_883_2004 } = MKV.KTObjects.lovvalgsbestemmelser;
const { KONV_EFTA_STORBRITANNIA_ART18_1 } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia;
const { FO_883_2004_ART16_1 } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004;
const { FO_883_2004_ART11_5 } = MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004;
const { ORDINAER, FLYENDE_PERSONELL, SOKKEL_ELLER_SKIP, ORDINAER_UTEN_ART12, IKKE_YRKESAKTIV, KONTANTYTELSESMOTTAKER } =
  KV.Koder.VurderingYrkesgruppeTyper;

const stegetsTilleggsbestemmelser = [
  {
    kode: FO_883_2004_ART11_5,
    label: MKV.Terms.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
  },
];

interface VurderingYrkesgruppeProps {
  bekreftOgFortsett: () => void;
  tilstand: {
    harAvklaring: boolean;
    yrkesgruppe?: string;
    tilleggbestemmelse?: string;
  };
  oppdaterData: (objekt: any) => void;
  slettData: (objekt?: any) => void;
  tilbake: () => void;
  redigerbart: boolean;
}

const VurderingYrkesgruppe = ({
  bekreftOgFortsett,
  tilstand: { harAvklaring, yrkesgruppe, tilleggbestemmelse },
  redigerbart,
  oppdaterData,
  slettData,
  tilbake,
}: VurderingYrkesgruppeProps) => {
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);
  const lovvalgsbestemmelse = useSelector(anmodningsperioderSelectors.LovvalgsbestemmelseSelector);
  const [bestemmelse, setBestemmelse] = useState(lovvalgsbestemmelse ?? "");
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const søknadslandkoder = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const visStorbritanniaKonvensjon = MKVUtils.enesteLandErStorbritannia(søknadslandkoder);
  const fakta = hentFaktaVerdi(yrkesgruppe);

  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.YRKESGRUPPE, yrkesgruppe));
    const tilleggBestemmelseFunnet = finnTilleggBestemmelse(tilleggbestemmelse, stegetsTilleggsbestemmelser);
    if (tilleggBestemmelseFunnet) oppdaterData(konverterTilleggBestemmelseTilStegData(tilleggbestemmelse));

    return () => {
      slettData();
    };
  }, []);

  const slettVilkår = () =>
    ["art16_1_anmodning", "art18_1_anmodning"].forEach((feltNavn) => slettData(slettVilkar(feltNavn)));

  const handleEndreYrkesgruppe = (event: ChangeEvent<HTMLInputElement>) => {
    setBestemmelse("");
    const yrkessituasjon = event.target.value;
    oppdaterData(lagAvklartfakta(KV.Koder.YRKESGRUPPE, null, yrkessituasjon));

    if (yrkessituasjon === FLYENDE_PERSONELL) {
      oppdaterData(lagTilleggBestemmelse(FO_883_2004_ART11_5));
    } else {
      slettData(slettTilleggBestemmelse());
    }

    if (konvensjonStorbritanniaToggleEnabled) {
      slettVilkår();
      if (yrkessituasjon === ORDINAER_UTEN_ART12 && !visStorbritanniaKonvensjon) {
        handleEndreBestemmelse(FO_883_2004_ART16_1);
      }
    } else {
      if (yrkessituasjon === ORDINAER_UTEN_ART12) {
        oppdaterData(lagVilkaar("art16_1_anmodning", true));
      } else {
        slettData(slettVilkar("art16_1_anmodning"));
      }
    }
  };

  const handleEndreBestemmelse = (nyBestemmelse: string) => {
    if (bestemmelse) {
      slettVilkår();
    }
    setBestemmelse(nyBestemmelse);

    const vilkårFeltNavn =
      nyBestemmelse === KONV_EFTA_STORBRITANNIA_ART18_1 ? "art18_1_anmodning" : "art16_1_anmodning";

    oppdaterData(lagVilkaar(vilkårFeltNavn, true));
    oppdaterData(lagLovvalgsbestemmelse(nyBestemmelse));
  };

  const hentBestemmelser = () => {
    if (visStorbritanniaKonvensjon) {
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
          checked={fakta === ORDINAER}
          value={ORDINAER}
          onChange={handleEndreYrkesgruppe}
          label="Yrkesaktiv"
        />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === SOKKEL_ELLER_SKIP}
          value={SOKKEL_ELLER_SKIP}
          onChange={handleEndreYrkesgruppe}
          label="Yrkesaktiv på sokkel eller skip"
        />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === FLYENDE_PERSONELL}
          value={FLYENDE_PERSONELL}
          onChange={handleEndreYrkesgruppe}
          label="Yrkesaktiv, som flygende personell"
        />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === ORDINAER_UTEN_ART12}
          value={ORDINAER_UTEN_ART12}
          onChange={handleEndreYrkesgruppe}
          label={
            konvensjonStorbritanniaToggleEnabled
              ? "Yrkesaktiv, direkte til vurdering av anmodning om unntak"
              : "Yrkesaktiv, direkte til vurdering av artikkel 16"
          }
        />
        {!(konvensjonStorbritanniaToggleEnabled && MKVUtils.erUtsendt(behandlingstema)) && (
          <>
            <Nav.Radio
              name="yrkesgruppe"
              disabled
              checked={fakta === IKKE_YRKESAKTIV}
              value={IKKE_YRKESAKTIV}
              onChange={handleEndreYrkesgruppe}
              label="Ikke yrkesaktiv"
            />
            <Nav.Radio
              name="yrkesgruppe"
              disabled
              checked={fakta === KONTANTYTELSESMOTTAKER}
              value={KONTANTYTELSESMOTTAKER}
              onChange={handleEndreYrkesgruppe}
              label="Kontantytelsesmottaker"
            />
          </>
        )}

        {konvensjonStorbritanniaToggleEnabled && fakta === ORDINAER_UTEN_ART12 && (
          <Nav.Select
            label="Velg bestemmelse"
            value={bestemmelse}
            onChange={(event) => handleEndreBestemmelse(event.target.value)}
            disabled={!redigerbart || !visStorbritanniaKonvensjon}
            bredde="fullbredde"
          >
            <option disabled={!!bestemmelse} key="" value="" label="Velg..." />
            {hentBestemmelser().map((ktobject) => (
              <option key={ktobject.kode} value={ktobject.kode} label={ktobject.term ?? ""} />
            ))}
          </Nav.Select>
        )}
      </Nav.Fieldset>
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
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
export default VurderingYrkesgruppe;
