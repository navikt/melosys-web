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
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../../featuretoggle/toggleNavn";
import { useSelector } from "react-redux";
import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import LandInformasjon from "./landInformasjon";
import Bestemmelse, { tilleggsbestemmelseFraLovvalgsbestemmelse } from "./bestemmelse";
import { vilkarSelectors } from "../../../../ducks/vilkar";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";

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
  art11_4_1eller13_4_1: Partial<Vilkaar>,
  art11_3Aeller13_3A: Partial<Vilkaar>,
  art11_4_2eller13_4_2: Partial<Vilkaar>
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

interface VurderingArtikkel11_4Props {
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

const VurderingArtikkel11_4 = ({
  oppdaterData,
  tilstand: { harAvklaring, nis },
  slettData,
  bekreftOgFortsett,
  redigerbart,
  tilbake,
}: VurderingArtikkel11_4Props) => {
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);
  const alleArbeidsland = useSelector(avklartefaktaSelectors.AlleArbeidslandSelector);
  const lovvalgsbestemmelse = useSelector(lovvalgsperioderSelectors.LovvalgBestemmelseSelector);
  const tilleggsbestemmelse = useSelector(lovvalgsperioderSelectors.TilleggBestemmelseSelector);
  const art11_3Aeller13_3A: Partial<Vilkaar> = useSelector(vilkarSelectors.Artikkel11_3AEller13_3ASelector);
  const art11_4_1eller13_4_1: Partial<Vilkaar> = useSelector(vilkarSelectors.Artikkel11_4_1Eller13_4_1Selector);
  const art11_4_2eller13_4_2: Partial<Vilkaar> = useSelector(vilkarSelectors.Artikkel11_4_2Eller13_4_2Selector);
  const [artikkelValg, setArtikkelValg] = useState(
    initialiserArtikkelValg(art11_3Aeller13_3A, art11_4_1eller13_4_1, art11_4_2eller13_4_2)
  );
  const [bestemmelse, setBestemmelse] = useState(lovvalgsbestemmelse);
  const visStorbritanniaKonvensjon = alleArbeidsland.some((landkode) => landkode === MKV.Koder.landkoder.GB);

  useEffect(() => {
    oppdaterData(konverterVilkarTilStegData(finnFeltNavn(art11_4_1eller13_4_1?.vilkaar), art11_4_1eller13_4_1));
    oppdaterData(konverterVilkarTilStegData(finnFeltNavn(art11_4_2eller13_4_2?.vilkaar), art11_4_2eller13_4_2));
    oppdaterData(konverterVilkarTilStegData(finnFeltNavn(art11_3Aeller13_3A?.vilkaar), art11_3Aeller13_3A));
    oppdaterData(konverterVilkarTilStegData("nis", nis));

    if (konvensjonStorbritanniaToggleEnabled) {
      oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));
      oppdaterData(konverterTilleggBestemmelseTilStegData(tilleggsbestemmelse));
    }

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

    if (konvensjonStorbritanniaToggleEnabled) {
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
    } else {
      /* eslint-disable no-lonely-if */
      if (value === ArtikkelValg.ART11_4_1) {
        oppdaterData(lagVilkaar("art11_4_1", true));
        oppdaterData(lagVilkaar("art11_3A", true));
        slettData(slettVilkar("art11_4_2"));
      } else if (value === ArtikkelValg.ART11_4_2) {
        slettData(slettVilkar("art11_3A"));
        slettData(slettVilkar("art11_4_1"));
        oppdaterData(lagVilkaar("art11_4_2", true));
        slettData(slettVilkar("nis"));
      } else {
        slettData(slettVilkar("art11_3A"));
        oppdaterData(lagVilkaar("art11_4_1", true));
        slettData(slettVilkar("art11_4_2"));
        slettData(slettVilkar("nis"));
      }
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
      oppdaterData(lagTilleggBestemmelse(nyTilleggsbestemmelse));
    }
    if (valgtArtikkel === ArtikkelValg.ART11_4_2) {
      oppdaterData(lagVilkaar(finnFeltNavn(nyBestemmelse), true));
    }

    oppdaterData(lagLovvalgsbestemmelse(nyBestemmelse));
  };

  const handleEndretNISSvar = (value: string) => {
    oppdaterData(lagVilkaar("nis", value === BOOLSK_STRING.SANN));
  };

  const visBestemmelseAvsnitt =
    konvensjonStorbritanniaToggleEnabled &&
    (artikkelValg === ArtikkelValg.ART11_4_1 || artikkelValg === ArtikkelValg.ART11_4_2);
  const visNISAvsnitt = artikkelValg === ArtikkelValg.ART11_4_1;

  return (
    <div className="vurderingArtikkel11_4">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        {konvensjonStorbritanniaToggleEnabled ? "Vurdering av skipsbestemmelse" : "Vurdering av artikkel 11.4"}
      </Nav.Typo.Innholdstittel>

      <LandInformasjon />

      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.RadioGroup
            legend={konvensjonStorbritanniaToggleEnabled ? "Oppgi brukers situasjon" : "Velg riktig artikkel"}
            onChange={handleEndretArtikkelValg}
            disabled={!redigerbart}
            name="artikkel11"
            defaultValue={artikkelValg}
            size="small"
          >
            <Nav.Radio value={ArtikkelValg.ART11_4_1}>
              {konvensjonStorbritanniaToggleEnabled ? "Arbeider på norsk skip" : "11.4 i - Norge er arbeidslandet"}
            </Nav.Radio>
            <Nav.Radio value={ArtikkelValg.ART11_4_2}>
              {konvensjonStorbritanniaToggleEnabled
                ? "Arbeider på utenlandsk skip, er bosatt i Norge og har norsk arbeidsgiver"
                : "11.4 ii - arbeidsgiver i bostedslandet"}
            </Nav.Radio>
            <Nav.Radio value={ArtikkelValg.ART11_4_1_TIL_VURDERING_12_1}>
              {konvensjonStorbritanniaToggleEnabled
                ? "Utsendt til utenlandsk skip"
                : "11.4 i - arbeidslandet er ikke Norge, men jeg vil vurdere Artikkel 12.1"}
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
              disabled={!redigerbart}
              defaultValue={nis.oppfylt}
              size="small"
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
};

export default VurderingArtikkel11_4;
