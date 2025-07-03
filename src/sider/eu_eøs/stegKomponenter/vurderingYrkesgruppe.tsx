import { useEffect, useState } from "react";
import MKV, { MKVUtils } from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import * as Mui from "../../../felleskomponenter/ui";
import {
  konverterAvklartfaktaTilStegData,
  konverterLovvalgsbestemmelseTilStegData,
  konverterTilleggBestemmelseTilStegData,
  lagAvklartfakta,
  lagLovvalgsbestemmelse,
  lagVilkaar,
  slettLovvalgsbestemmelse,
  slettTilleggBestemmelse,
  slettVilkarIAlleSteg,
} from "../../../felleskomponenter/stegvelger";
import { finnTilleggBestemmelse, hentFaktaVerdi } from "../../../domeneUtils";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { useSelector } from "react-redux";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { anmodningsperioderSelectors } from "../../../ducks/anmodningsperioder";
import { avklartefaktaSelectors } from "../../../ducks/avklartefakta";

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

const { UTSENDT_ARBEIDSTAKER, UTSENDT_SELVSTENDIG, ARBEID_KUN_NORGE } = MKV.Koder.behandlinger.behandlingstema;

function VurderingYrkesgruppe({
  bekreftOgFortsett,
  tilstand: { harAvklaring, yrkesgruppe, tilleggbestemmelse },
  redigerbart,
  oppdaterData,
  slettData,
  tilbake,
}: VurderingYrkesgruppeProps) {
  const lovvalgsbestemmelse = useSelector(anmodningsperioderSelectors.LovvalgsbestemmelseSelector);
  const [bestemmelse, setBestemmelse] = useState(lovvalgsbestemmelse ?? "");
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const søknadslandkoder = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const visStorbritanniaKonvensjon = MKVUtils.enesteLandErStorbritannia(søknadslandkoder);
  const fakta = hentFaktaVerdi(yrkesgruppe);
  const erUtsendt = [UTSENDT_ARBEIDSTAKER, UTSENDT_SELVSTENDIG].includes(behandlingstema);
  const erArbeidslandNorge = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector).some(
    (land: any) => land.kode === "NO",
  );
  const erArbeidKunNorgeBehandlingstema = behandlingstema === ARBEID_KUN_NORGE;

  const skalViseArbeidKunNorgeFlyt = (erUtsendt || erArbeidKunNorgeBehandlingstema) && erArbeidslandNorge;
  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.YRKESGRUPPE, yrkesgruppe));
    const tilleggBestemmelseFunnet = finnTilleggBestemmelse(tilleggbestemmelse, stegetsTilleggsbestemmelser);
    if (lovvalgsbestemmelse) oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));
    if (tilleggBestemmelseFunnet) oppdaterData(konverterTilleggBestemmelseTilStegData(tilleggbestemmelse));

    return () => {
      slettData();
    };
  }, []);

  const slettVilkår = () =>
    ["art16_1_anmodning", "art18_1_anmodning"].forEach((feltNavn) => slettData(slettVilkarIAlleSteg(feltNavn)));

  const handleEndreYrkesgruppe = (value: string) => {
    setBestemmelse("");
    const yrkessituasjon = value;
    oppdaterData(lagAvklartfakta(KV.Koder.YRKESGRUPPE, null, yrkessituasjon));

    slettData(slettTilleggBestemmelse());
    slettData(slettLovvalgsbestemmelse());
    slettVilkår();
    if (yrkessituasjon === ORDINAER_UTEN_ART12 && !visStorbritanniaKonvensjon) {
      handleEndreBestemmelse(FO_883_2004_ART16_1);
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
    <div className="vurderingYrkesgruppe">
      <Nav.Heading level="1" className="stegvelgertittel">
        Yrkessituasjon
      </Nav.Heading>
      <Nav.RadioGroup
        legend="Hva er brukers yrkessituasjon?"
        onChange={handleEndreYrkesgruppe}
        name="yrkesgruppe"
        defaultValue={fakta}
        readOnly={!redigerbart}
      >
        <Nav.Radio value={ORDINAER}>Yrkesaktiv</Nav.Radio>
        <Nav.Radio value={SOKKEL_ELLER_SKIP}>Yrkesaktiv på sokkel eller skip</Nav.Radio>
        {!skalViseArbeidKunNorgeFlyt && (
          <>
            <Nav.Radio value={FLYENDE_PERSONELL}>Yrkesaktiv, som flygende personell</Nav.Radio>
            <Nav.Radio value={ORDINAER_UTEN_ART12}>Yrkesaktiv, direkte til vurdering av anmodning om unntak</Nav.Radio>
            {!MKVUtils.erUtsendt(behandlingstema) && (
              <>
                <Nav.Radio readOnly value={IKKE_YRKESAKTIV}>
                  Ikke yrkesaktiv
                </Nav.Radio>
                <Nav.Radio readOnly value={KONTANTYTELSESMOTTAKER}>
                  Kontantytelsesmottaker
                </Nav.Radio>
              </>
            )}
          </>
        )}

        {fakta === ORDINAER_UTEN_ART12 && (
          <Nav.Select
            label="Velg bestemmelse"
            value={bestemmelse}
            onChange={(event) => handleEndreBestemmelse(event.target.value)}
            readOnly={!redigerbart || !visStorbritanniaKonvensjon}
          >
            <option disabled={!!bestemmelse} key="" value="" label="Velg..." />
            {hentBestemmelser().map((ktobject) => (
              <option key={ktobject.kode} value={ktobject.kode} label={ktobject.term ?? ""} />
            ))}
          </Nav.Select>
        )}
      </Nav.RadioGroup>
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
}

VurderingYrkesgruppe.ID = "YRKESGRUPPE";
export default VurderingYrkesgruppe;
