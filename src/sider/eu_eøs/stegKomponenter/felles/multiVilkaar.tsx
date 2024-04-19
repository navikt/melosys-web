import MKV, { MKVUtils } from "../../../../melosyskodeverk";

import * as Nav from "../../../../navFrontend";
import {
  konverterVilkarTilStegData,
  lagVilkaar,
  lagVilkarbegrunnelse,
  slettVilkar,
} from "../../../../felleskomponenter/stegvelger";

import * as Mui from "../../../../felleskomponenter/ui";
import { ChangeEvent, useEffect, useState } from "react";
import { Vilkaar } from "../../../../services/modules/vilkar";
import { useSelector } from "react-redux";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../../featuretoggle/toggleNavn";
import { KTObject } from "@navikt/melosys-kodeverk";
import * as KV from "../../../../kodeverk";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";

const VilkaarKode16 = MKV.Koder.vilkaar.FO_883_2004_ART16_1;
const AVSLAG = "AVSLAG";
const { lovvalgbestemmelser_konv_efta_storbritannia } = MKV.KTObjects.lovvalgsbestemmelser;
const { lovvalgbestemmelser_883_2004 } = MKV.KTObjects.lovvalgsbestemmelser;
const {
  KONV_EFTA_STORBRITANNIA_ART14_1,
  KONV_EFTA_STORBRITANNIA_ART14_2,
  KONV_EFTA_STORBRITANNIA_ART16_1,
  KONV_EFTA_STORBRITANNIA_ART16_3,
  KONV_EFTA_STORBRITANNIA_ART18_1,
} = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia;
const { FO_883_2004_ART12_1, FO_883_2004_ART12_2, FO_883_2004_ART16_1 } =
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004;
const {
  IKKE_UTSENDT_PAA_OPPDRAG_FOR_AG,
  IKKE_NORSK_AG_REGNING,
  IKKE_OMFATTET_LENGE_NOK_I_NORGE_FOER,
  IKKE_VESENTLIG_VIRKSOMHET,
} = MKV.Koder.begrunnelser.art12_1_begrunnelser;
const { IKKE_LIGNENDE_VIRKSOMHET, NORMALT_IKKE_DRIFT_NORGE } = MKV.Koder.begrunnelser.art12_2_begrunnelser;

interface MultiVilkaarProps {
  oppdaterData: (objekt: any) => void;
  slettData: (objekt: any) => void;
  redigerbart: boolean;
  vilkaar12: Partial<Vilkaar>;
  vilkaarNavn12: "12.1" | "12.2";
  vilkaarKode12: string;
  begrunnelser12: KTObject[];
  vilkaar16: Partial<Vilkaar>;
}

export const MultiVilkaar = ({
  oppdaterData,
  slettData,
  vilkaar12,
  vilkaarKode12,
  vilkaar16,
  redigerbart,
  vilkaarNavn12,
  begrunnelser12,
}: MultiVilkaarProps) => {
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);
  const [valgtBestemmelse, setValgtBestemmelse] = useState("");
  const arbeidsland = useSelector(avklartefaktaSelectors.ArbeidslandSelector);
  const erSokkel = useSelector(avklartefaktaSelectors.InstallasjonsTypeSelector) === KV.Koder.SOKKEL;

  const visStorbritanniaKonvensjon = MKVUtils.enesteLandErStorbritannia(arbeidsland);
  const er12_1 = vilkaarNavn12 === "12.1";
  const FO_883_2004_ART12 = er12_1 ? FO_883_2004_ART12_1 : FO_883_2004_ART12_2;
  const KONV_EFTA_STORBRITANNIA_ART14 = er12_1 ? KONV_EFTA_STORBRITANNIA_ART14_1 : KONV_EFTA_STORBRITANNIA_ART14_2;
  const KONV_EFTA_STORBRITANNIA_ART16 = er12_1 ? KONV_EFTA_STORBRITANNIA_ART16_1 : KONV_EFTA_STORBRITANNIA_ART16_3;

  const innvilgelse = vilkaar12.oppfylt;
  const anmodningOmUnntak = vilkaar12.oppfylt === false && vilkaar16.oppfylt;
  const avslag = vilkaar12.oppfylt === false && vilkaar16.oppfylt === false;

  useEffect(() => {
    oppdaterData(konverterVilkarTilStegData(vilkaarKode12, vilkaar12));
    oppdaterData(konverterVilkarTilStegData("art16_1", vilkaar16));
  }, []);

  const vilkaarEndret = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValgtBestemmelse("");

    if (value === vilkaarKode12) {
      oppdaterData(lagVilkaar(vilkaarKode12, true));
      slettData(slettVilkar("art16_1_avslag"));
      slettData(slettVilkar("art16_1_anmodning"));
      if (!visStorbritanniaKonvensjon) setValgtBestemmelse(FO_883_2004_ART12);
    } else if (value === VilkaarKode16) {
      oppdaterData(lagVilkaar(vilkaarKode12, false));
      slettData(slettVilkar("art16_1_avslag"));
      oppdaterData(lagVilkaar("art16_1_anmodning", true));
      if (!visStorbritanniaKonvensjon) setValgtBestemmelse(FO_883_2004_ART16_1);
    } else if (value === AVSLAG) {
      oppdaterData(lagVilkaar(vilkaarKode12, false));
      slettData(slettVilkar("art16_1_anmodning"));
      oppdaterData(lagVilkaar("art16_1_avslag", false));
    }
  };

  const begrunnelseEndret = (value: string[], id: string) => {
    oppdaterData(lagVilkarbegrunnelse(id, value));
  };

  const fritekstEndret = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value, id } = event.target;
    oppdaterData(lagVilkarbegrunnelse(id, null, value));
  };

  const hentBestemmelser = (): KTObject[] => {
    if (!konvensjonStorbritanniaToggleEnabled) return [];

    if (innvilgelse) {
      if (visStorbritanniaKonvensjon) {
        return [
          KV.kodeTilObjekt(
            erSokkel ? KONV_EFTA_STORBRITANNIA_ART16 : KONV_EFTA_STORBRITANNIA_ART14,
            lovvalgbestemmelser_konv_efta_storbritannia
          ),
          KV.kodeTilObjekt(FO_883_2004_ART12, lovvalgbestemmelser_883_2004),
        ];
      }
      return [KV.kodeTilObjekt(FO_883_2004_ART12, lovvalgbestemmelser_883_2004)];
    }

    if (anmodningOmUnntak) {
      if (visStorbritanniaKonvensjon) {
        return [
          KV.kodeTilObjekt(KONV_EFTA_STORBRITANNIA_ART18_1, lovvalgbestemmelser_konv_efta_storbritannia),
          KV.kodeTilObjekt(FO_883_2004_ART16_1, lovvalgbestemmelser_883_2004),
        ];
      }
      return [KV.kodeTilObjekt(FO_883_2004_ART16_1, lovvalgbestemmelser_883_2004)];
    }

    return [];
  };

  const hentBegrunnelser = (): KTObject[] => {
    const bestemmelseErStorbritanniaKonvensjon = valgtBestemmelse === KONV_EFTA_STORBRITANNIA_ART18_1;
    if (!bestemmelseErStorbritanniaKonvensjon || !erSokkel) return begrunnelser12;

    const sokkelKoder = [
      // artikkel 12.1:
      IKKE_UTSENDT_PAA_OPPDRAG_FOR_AG,
      IKKE_NORSK_AG_REGNING,
      IKKE_OMFATTET_LENGE_NOK_I_NORGE_FOER,
      IKKE_VESENTLIG_VIRKSOMHET,
      // artikkel 12.2:
      IKKE_LIGNENDE_VIRKSOMHET,
      NORMALT_IKKE_DRIFT_NORGE,
    ];
    return begrunnelser12.filter((value) => sokkelKoder.includes(value.kode));
  };

  const hentAvslagBegrunnelser = () => (vilkaar16 ? vilkaar16.begrunnelseKoder || [] : []);

  const visFritekstfelt = hentAvslagBegrunnelser().includes(MKV.Koder.begrunnelser.art16_1_avslag.SAERLIG_AVSLAGSGRUNN);

  return (
    <div>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">{`Fyller søker kriteriene for artikkel ${vilkaarNavn12}?`}</Nav.Typo.Innholdstittel>
      <div>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Fieldset legend="">
              <Nav.Radio
                name="artikkel12"
                onChange={vilkaarEndret}
                value={vilkaarKode12}
                checked={innvilgelse}
                label="Ja"
                disabled={!redigerbart}
              />
              <Nav.Radio
                name="artikkel12"
                onChange={vilkaarEndret}
                value={VilkaarKode16}
                checked={anmodningOmUnntak}
                label="Nei, jeg vil vurdere artikkel 16.1"
                disabled={!redigerbart}
              />
              <Nav.Radio
                name="artikkel12"
                onChange={vilkaarEndret}
                value={AVSLAG}
                checked={avslag}
                label={`Nei, jeg vil avslå søknaden etter artikkel ${vilkaarNavn12} og 16.1`}
                disabled={!redigerbart}
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12" md="10" lg="8">
            {konvensjonStorbritanniaToggleEnabled && (innvilgelse || anmodningOmUnntak) && (
              <Nav.Select
                label="Velg bestemmelse"
                disabled={!redigerbart || !visStorbritanniaKonvensjon}
                value={valgtBestemmelse}
                onChange={(e) => setValgtBestemmelse(e.target.value)}
              >
                <option disabled={!!valgtBestemmelse} value="" key="" label="Velg..." />
                {hentBestemmelser().map((element) => (
                  <option key={element.kode} value={element.kode} label={element.term ?? ""} />
                ))}
              </Nav.Select>
            )}
            {vilkaar12.oppfylt === false && (!konvensjonStorbritanniaToggleEnabled || !!valgtBestemmelse) && (
              <Nav.Fieldset legend={`Begrunnelse artikkel ${vilkaarNavn12}:`}>
                <Mui.ListevelgerFlervalg
                  muligeValg={hentBegrunnelser()}
                  label="Legg til begrunnelse for ikke oppfylt:"
                  tillatFritekst={false}
                  onChange={(e: { value: string[] }) => begrunnelseEndret(e.value, vilkaarKode12)}
                  defaultElementer={vilkaar12.begrunnelseKoder}
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
            )}
            {vilkaar16.oppfylt === false && (
              <Nav.Fieldset legend="Begrunnelse artikkel 16.1:">
                <Mui.ListevelgerFlervalg
                  muligeValg={MKV.KTObjects.begrunnelser.art16_1_avslag}
                  label="Legg til begrunnelse for avslag:"
                  tillatFritekst={false}
                  onChange={(e: { value: string[] }) => begrunnelseEndret(e.value, "art16_1_avslag")}
                  defaultElementer={vilkaar16.begrunnelseKoder}
                  disabled={!redigerbart}
                />
                {visFritekstfelt && (
                  <Nav.Textarea
                    id="art16_1_avslag"
                    label="Begrunnelse for avslag (fritekst):"
                    maxLength={255}
                    bredde="fullbredde"
                    value={vilkaar16.begrunnelseFritekst || ""}
                    onChange={fritekstEndret}
                    disabled={!redigerbart}
                  />
                )}
              </Nav.Fieldset>
            )}
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
};

export default MultiVilkaar;
