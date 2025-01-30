import { useEffect, useState } from "react";
import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import "./vurderingArtikkel11_4.css";
import {
  konverterLovvalgsbestemmelseTilStegData,
  konverterTilleggBestemmelseTilStegData,
  konverterVilkarTilStegData,
  lagLovvalgsbestemmelse,
  lagTilleggBestemmelse,
  lagVilkaar,
  slettLovvalgsbestemmelse,
  slettTilleggBestemmelse,
  slettVilkar,
} from "../../../../felleskomponenter/stegvelger";
import { Vilkaar } from "../../../../services/modules/vilkar";
import { BOOLSK_STRING } from "../../../../constants";
import { useSelector } from "react-redux";
import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import LandInformasjon from "./landInformasjon";
import Bestemmelse, { tilleggsbestemmelseFraLovvalgsbestemmelse } from "./bestemmelse";
import { vilkarSelectors } from "../../../../ducks/vilkar";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import * as Utils from "../../../../utils";

const {
  FO_883_2004_ART11_3A,
  KONV_EFTA_STORBRITANNIA_ART13_3A,
  FO_883_2004_ART11_4_1,
  KONV_EFTA_STORBRITANNIA_ART13_4_1,
  FO_883_2004_ART11_4_2,
  KONV_EFTA_STORBRITANNIA_ART13_4_2,
} = MKV.Koder.vilkaar;

export enum ArtikkelValg {
  ART11_4_1 = "ART11_4_1",
  ART11_4_2 = "ART11_4_2",
  ART11_4_1_TIL_VURDERING_12_1 = "ART11_4_1_TIL_VURDERING_12_1",
}

const finnFeltNavn = (vilkårKode?: string): string => {
  if (vilkårKode === FO_883_2004_ART11_4_1) return "art11_4_1";
  if (vilkårKode === FO_883_2004_ART11_4_2) return "art11_4_2";
  if (vilkårKode === FO_883_2004_ART11_3A) return "art11_3A";
  return vilkårKode ?? "";
};

const initialiserArtikkelValg = (
  art11_3Aeller13_3A: Partial<Vilkaar>,
  art11_4_1eller13_4_1: Partial<Vilkaar>,
  art11_4_2eller13_4_2: Partial<Vilkaar>,
): ArtikkelValg | undefined => {
  if (art11_4_1eller13_4_1.oppfylt === true && art11_3Aeller13_3A.oppfylt === true) {
    return ArtikkelValg.ART11_4_1;
  }
  if (art11_4_2eller13_4_2.oppfylt === true) {
    return ArtikkelValg.ART11_4_2;
  }
  if (art11_4_1eller13_4_1.oppfylt === true && art11_3Aeller13_3A.oppfylt === undefined) {
    return ArtikkelValg.ART11_4_1_TIL_VURDERING_12_1;
  }
  return undefined;
};

interface VurderingArtikkel114Props {
  bekreftOgFortsett: () => void;
  tilstand: {
    harAvklaring: boolean;
    nis: Partial<Vilkaar>;
  };
  redigerbart: boolean;
  oppdaterData: (objekt: any) => void;
  slettData: (objekt?: any) => void;
  tilbake: () => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VurderingArtikkel11_4({
  oppdaterData,
  tilstand: { harAvklaring, nis },
  slettData,
  bekreftOgFortsett,
  redigerbart,
  tilbake,
}: VurderingArtikkel114Props) {
  const alleLand = useSelector(avklartefaktaSelectors.AlleRelevanteLandSelector);
  const lovvalgsbestemmelse = useSelector(lovvalgsperioderSelectors.LovvalgBestemmelseSelector);
  const tilleggsbestemmelse = useSelector(lovvalgsperioderSelectors.TilleggBestemmelseSelector);
  const art113Aeller133A: Partial<Vilkaar> = useSelector(vilkarSelectors.Artikkel11_3AEller13_3ASelector);
  const art1141eller1341: Partial<Vilkaar> = useSelector(vilkarSelectors.Artikkel11_4_1Eller13_4_1Selector);
  const art1142eller1342: Partial<Vilkaar> = useSelector(vilkarSelectors.Artikkel11_4_2Eller13_4_2Selector);
  const [artikkelValg, setArtikkelValg] = useState(
    initialiserArtikkelValg(art113Aeller133A, art1141eller1341, art1142eller1342),
  );
  const [bestemmelse, setBestemmelse] = useState(lovvalgsbestemmelse);
  const visStorbritanniaKonvensjon = alleLand.some((landkode) => landkode === MKV.Koder.landkoder.GB);
  const erArbeidslandNorge = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector).some(
    (land: any) => land.kode === "NO",
  );
  useEffect(() => {
    oppdaterData(konverterVilkarTilStegData(finnFeltNavn(art1141eller1341?.vilkaar), art1141eller1341));
    oppdaterData(konverterVilkarTilStegData(finnFeltNavn(art1142eller1342?.vilkaar), art1142eller1342));
    oppdaterData(konverterVilkarTilStegData(finnFeltNavn(art113Aeller133A?.vilkaar), art113Aeller133A));
    oppdaterData(konverterVilkarTilStegData("nis", nis));

    if (lovvalgsbestemmelse) oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));
    if (tilleggsbestemmelse) oppdaterData(konverterTilleggBestemmelseTilStegData(tilleggsbestemmelse));

    return () => {
      slettData();
    };
  }, []);

  const slettAlleVilkår = () =>
    [
      "art11_3A",
      "art11_4_1",
      "art11_4_2",
      KONV_EFTA_STORBRITANNIA_ART13_3A,
      KONV_EFTA_STORBRITANNIA_ART13_4_1,
      KONV_EFTA_STORBRITANNIA_ART13_4_2,
      "nis",
    ].forEach((feltNavn) => slettData(slettVilkar(feltNavn)));

  const handleEndretArtikkelValg = (value: ArtikkelValg) => {
    setArtikkelValg(value);
    setBestemmelse("");

    slettData(slettTilleggBestemmelse());
    slettData(slettLovvalgsbestemmelse());
    slettAlleVilkår();
    if (value === ArtikkelValg.ART11_4_1 && !visStorbritanniaKonvensjon) {
      handleEndreBestemmelse(FO_883_2004_ART11_3A, value);
    } else if (value === ArtikkelValg.ART11_4_2 && !visStorbritanniaKonvensjon) {
      handleEndreBestemmelse(FO_883_2004_ART11_4_2, value);
    } else if (value === ArtikkelValg.ART11_4_1_TIL_VURDERING_12_1) {
      oppdaterData(lagVilkaar("art11_4_1", true));
    }
  };

  const handleEndreBestemmelse = (nyBestemmelse: string, valgtArtikkel = artikkelValg) => {
    if (bestemmelse) {
      slettAlleVilkår();
    }
    setBestemmelse(nyBestemmelse);

    if (valgtArtikkel === ArtikkelValg.ART11_4_1) {
      const nyTilleggsbestemmelse: string | undefined = tilleggsbestemmelseFraLovvalgsbestemmelse(nyBestemmelse);
      oppdaterData(lagVilkaar(finnFeltNavn(nyBestemmelse), true));
      oppdaterData(lagVilkaar(finnFeltNavn(nyTilleggsbestemmelse), true));
      if (tilleggsbestemmelse) oppdaterData(lagTilleggBestemmelse(nyTilleggsbestemmelse));
    }
    if (valgtArtikkel === ArtikkelValg.ART11_4_2) {
      oppdaterData(lagVilkaar(finnFeltNavn(nyBestemmelse), true));
    }

    oppdaterData(lagLovvalgsbestemmelse(nyBestemmelse));
  };

  const handleEndretNISSvar = (value: string) => {
    oppdaterData(lagVilkaar("nis", value === BOOLSK_STRING.SANN));
  };

  const visBestemmelseAvsnitt = artikkelValg === ArtikkelValg.ART11_4_1 || artikkelValg === ArtikkelValg.ART11_4_2;
  const visNISAvsnitt = artikkelValg === ArtikkelValg.ART11_4_1;

  return (
    <div className="vurderingArtikkel11_4">
      <Nav.Heading level="1" className="stegvelgertittel">
        Vurdering av skipsbestemmelse
      </Nav.Heading>

      <LandInformasjon />

      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.RadioGroup
            legend="Oppgi brukers situasjon"
            onChange={handleEndretArtikkelValg}
            readOnly={!redigerbart}
            name="artikkel11"
            defaultValue={artikkelValg}
          >
            <Nav.Radio value={ArtikkelValg.ART11_4_1} readOnly={!erArbeidslandNorge}>
              Arbeider på norsk skip
            </Nav.Radio>
            <Nav.Radio value={ArtikkelValg.ART11_4_2} readOnly={erArbeidslandNorge}>
              Arbeider på utenlandsk skip, er bosatt i Norge og har norsk arbeidsgiver
            </Nav.Radio>
            <Nav.Radio value={ArtikkelValg.ART11_4_1_TIL_VURDERING_12_1} readOnly={erArbeidslandNorge}>
              Utsendt til utenlandsk skip
            </Nav.Radio>
          </Nav.RadioGroup>

          {visBestemmelseAvsnitt && (
            <Bestemmelse
              bestemmelse={bestemmelse}
              handleEndreBestemmelse={handleEndreBestemmelse}
              artikkelValg={artikkelValg}
              redigerbart={redigerbart}
              visStorbritanniaKonvensjon={visStorbritanniaKonvensjon}
            />
          )}

          {visNISAvsnitt && (
            <Nav.RadioGroup
              legend="Jobber søker i hotell- eller restaurantnæring på NIS-registrert skip?"
              onChange={handleEndretNISSvar}
              name="nis"
              readOnly={!redigerbart}
              defaultValue={Utils.streng.boolTilUppercaseStreng(nis.oppfylt)}
            >
              <Nav.Radio value={BOOLSK_STRING.USANN}>Nei</Nav.Radio>
              <Nav.Radio value={BOOLSK_STRING.SANN}>Ja</Nav.Radio>
            </Nav.RadioGroup>
          )}
        </Nav.Column>
      </Nav.Row>

      <Mui.StegKnapper
        bekreftKnappProps={{ disabled: !(redigerbart && harAvklaring), onClick: bekreftOgFortsett }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}

export default VurderingArtikkel11_4;
