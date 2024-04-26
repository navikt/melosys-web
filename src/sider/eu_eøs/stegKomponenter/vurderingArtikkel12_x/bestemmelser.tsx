import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import {
  konverterVilkarTilStegData,
  lagLovvalgsbestemmelse,
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
import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { vilkarSelectors } from "../../../../ducks/vilkar";
import {
  alleRelevanteFeltNavn,
  begrunnelseKoderForSokkelStorbritannia,
  finnFeltNavn,
  hentRelevantUtsendelseArtikkel12,
  hentRelevantUtsendelseArtikkel14,
  hentRelevantUtsendelseArtikkel16,
  initializeVedtakValg,
  kodeTilObjektEØS,
  kodeTilObjektKonvGB,
  VedtakValg,
} from "./bestemmelserUtils";
import { anmodningsperioderSelectors } from "../../../../ducks/anmodningsperioder";

const { FO_883_2004_ART16_1, KONV_EFTA_STORBRITANNIA_ART18_1 } = MKV.Koder.vilkaar;
const { SAERLIG_AVSLAGSGRUNN } = MKV.Koder.begrunnelser.art16_1_avslag;

interface ListevelgerFlervalgEvent {
  value: string[];
}

interface BestemmelserProps {
  oppdaterData: (objekt: any) => void;
  slettData: (objekt: any) => void;
  redigerbart: boolean;
  vilkaarNavn12: "12.1" | "12.2";
  begrunnelserUtsending: KTObject[];
  visStorbritanniaKonvensjon: boolean;
}

export const Bestemmelser = ({
  oppdaterData,
  slettData,
  vilkaarNavn12,
  begrunnelserUtsending,
  redigerbart,
  visStorbritanniaKonvensjon,
}: BestemmelserProps) => {
  const erArbeidstaker = vilkaarNavn12 === "12.1";
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);
  const lovvalgsbestemmelse = useSelector(lovvalgsperioderSelectors.LovvalgBestemmelseSelector);
  const anmodningsbestemmelse = useSelector(anmodningsperioderSelectors.LovvalgsbestemmelseSelector);
  const utsendingsvilkår: Partial<Vilkaar> = useSelector(vilkarSelectors.UtsendingsvilkårSelector);
  const unntaksvilkår: Partial<Vilkaar> = useSelector(vilkarSelectors.UnntaksvilkårSelector);
  const erSokkel = useSelector(avklartefaktaSelectors.InstallasjonsTypeSelector) === KV.Koder.SOKKEL;

  const [vedtakValg, setVedtakValg] = useState(initializeVedtakValg(utsendingsvilkår, unntaksvilkår));
  const [bestemmelse, setBestemmelse] = useState(lovvalgsbestemmelse ?? anmodningsbestemmelse ?? "");
  const [pending, setPending] = useState(false);

  const FO_883_2004_ART12 = hentRelevantUtsendelseArtikkel12(erArbeidstaker);
  const KONV_EFTA_STORBRITANNIA_ART14 = hentRelevantUtsendelseArtikkel14(erArbeidstaker);
  const KONV_EFTA_STORBRITANNIA_ART16 = hentRelevantUtsendelseArtikkel16(erArbeidstaker);

  const innvilgelse = vedtakValg === VedtakValg.JA_INNVILGE;
  const anmodningOmUnntak = vedtakValg === VedtakValg.NEI_ANMODNING_UNNTAK;
  const avslag = vedtakValg === VedtakValg.NEI_AVSLAG;

  useEffect(() => {
    oppdaterData(konverterVilkarTilStegData(finnFeltNavn(utsendingsvilkår?.vilkaar), utsendingsvilkår));
    oppdaterData(konverterVilkarTilStegData(finnFeltNavn(unntaksvilkår?.vilkaar), unntaksvilkår));
  }, []);

  const slettAlleVilkår = () => alleRelevanteFeltNavn.forEach((feltNavn) => slettData(slettVilkar(feltNavn)));

  const handleEndreVedtakValg = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as VedtakValg;
    setVedtakValg(value);
    setBestemmelse("");

    if (konvensjonStorbritanniaToggleEnabled) {
      if (value === VedtakValg.JA_INNVILGE) {
        slettAlleVilkår();
        if (!visStorbritanniaKonvensjon) setBestemmelse(FO_883_2004_ART12);
      } else if (value === VedtakValg.NEI_ANMODNING_UNNTAK) {
        slettAlleVilkår();
        if (!visStorbritanniaKonvensjon) setBestemmelse(FO_883_2004_ART16_1);
      } else if (value === VedtakValg.NEI_AVSLAG) {
        slettAlleVilkår();
        oppdaterData(lagVilkaar(finnFeltNavn(FO_883_2004_ART12), false));
        oppdaterData(lagVilkaar("art16_1_avslag", false));
      }
    } else {
      if (value === VedtakValg.JA_INNVILGE) {
        oppdaterData(lagVilkaar(finnFeltNavn(FO_883_2004_ART12), true));
        slettData(slettVilkar("art16_1_avslag"));
        slettData(slettVilkar("art16_1_anmodning"));
      }
      if (value === VedtakValg.NEI_ANMODNING_UNNTAK) {
        oppdaterData(lagVilkaar(finnFeltNavn(FO_883_2004_ART12), false));
        slettData(slettVilkar("art16_1_avslag"));
        oppdaterData(lagVilkaar("art16_1_anmodning", true));
      }
      if (value === VedtakValg.NEI_AVSLAG) {
        oppdaterData(lagVilkaar(finnFeltNavn(FO_883_2004_ART12), false));
        slettData(slettVilkar("art16_1_anmodning"));
        oppdaterData(lagVilkaar("art16_1_avslag", false));
      }
    }
  };

  const finnUtsendelsevilkår = (unntaksvilkårKode: string) => {
    if (unntaksvilkårKode === FO_883_2004_ART16_1) return FO_883_2004_ART12;
    return erSokkel ? KONV_EFTA_STORBRITANNIA_ART16 : KONV_EFTA_STORBRITANNIA_ART14;
  };
  const handleEndreBestemmelse = (event: ChangeEvent<HTMLSelectElement>) => {
    setPending(true);
    if (bestemmelse) {
      slettAlleVilkår();
    }
    const nyBestemmelse = event.target.value;
    setBestemmelse(nyBestemmelse);

    if (innvilgelse) {
      const utsendelsevilkårFeltNavn = finnFeltNavn(nyBestemmelse);
      oppdaterData(lagVilkaar(utsendelsevilkårFeltNavn, true));
    }
    if (anmodningOmUnntak) {
      const utsendelsevilkår = finnUtsendelsevilkår(nyBestemmelse);
      const unntaksvilkårFeltNavn = finnFeltNavn(nyBestemmelse);
      oppdaterData(lagVilkaar(finnFeltNavn(utsendelsevilkår), false));
      oppdaterData(lagVilkaar(`${unntaksvilkårFeltNavn}_anmodning`, true));
    }

    oppdaterData(lagLovvalgsbestemmelse(nyBestemmelse));

    setTimeout(() => setPending(false), 100);
  };

  const handleEndreBegrunnelse = (event: ListevelgerFlervalgEvent, id: string) => {
    oppdaterData(lagVilkarbegrunnelse(id, event.value));
  };

  const handleEndreFritekst = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value, id } = event.target;
    oppdaterData(lagVilkarbegrunnelse(id, null, value));
  };

  const hentBestemmelser = (): KTObject[] => {
    if (innvilgelse) {
      return visStorbritanniaKonvensjon
        ? [
            kodeTilObjektKonvGB(erSokkel ? KONV_EFTA_STORBRITANNIA_ART16 : KONV_EFTA_STORBRITANNIA_ART14),
            kodeTilObjektEØS(FO_883_2004_ART12),
          ]
        : [kodeTilObjektEØS(FO_883_2004_ART12)];
    }
    if (anmodningOmUnntak) {
      return visStorbritanniaKonvensjon
        ? [kodeTilObjektKonvGB(KONV_EFTA_STORBRITANNIA_ART18_1), kodeTilObjektEØS(FO_883_2004_ART16_1)]
        : [kodeTilObjektEØS(FO_883_2004_ART16_1)];
    }
    return [];
  };

  const hentBegrunnelser = (): KTObject[] => {
    const bestemmelseErStorbritanniaKonvensjon18_1 = bestemmelse === KONV_EFTA_STORBRITANNIA_ART18_1;
    if (!bestemmelseErStorbritanniaKonvensjon18_1 || !erSokkel) return begrunnelserUtsending;

    return begrunnelserUtsending.filter((value) => begrunnelseKoderForSokkelStorbritannia.includes(value.kode));
  };

  const visFritekstfelt = unntaksvilkår?.begrunnelseKoder?.includes(SAERLIG_AVSLAGSGRUNN);
  const bestemmelseErGyldig = !!bestemmelse || !konvensjonStorbritanniaToggleEnabled || avslag;

  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Fieldset legend="">
            <Nav.Radio
              name="vedtakValg"
              onChange={handleEndreVedtakValg}
              value={VedtakValg.JA_INNVILGE}
              checked={innvilgelse}
              label={konvensjonStorbritanniaToggleEnabled ? "Ja, jeg vil innvilge søknaden" : "Ja"}
              disabled={!redigerbart}
            />
            <Nav.Radio
              name="vedtakValg"
              onChange={handleEndreVedtakValg}
              value={VedtakValg.NEI_ANMODNING_UNNTAK}
              checked={anmodningOmUnntak}
              label={
                konvensjonStorbritanniaToggleEnabled
                  ? "Nei, jeg vil vurdere anmodning om unntak"
                  : "Nei, jeg vil vurdere artikkel 16.1"
              }
              disabled={!redigerbart}
            />
            <Nav.Radio
              name="vedtakValg"
              onChange={handleEndreVedtakValg}
              value={VedtakValg.NEI_AVSLAG}
              checked={avslag}
              label={
                konvensjonStorbritanniaToggleEnabled
                  ? `Nei, jeg vil avslå søknaden etter artikkel ${vilkaarNavn12} og 16.1 (kun EØS-forordningen)`
                  : `Nei, jeg vil avslå søknaden etter artikkel ${vilkaarNavn12} og 16.1`
              }
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
              value={bestemmelse}
              onChange={handleEndreBestemmelse}
            >
              <option disabled={!!bestemmelse} value="" key="" label="Velg..." />
              {hentBestemmelser().map((element) => (
                <option key={element.kode} value={element.kode} label={element.term ?? ""} />
              ))}
            </Nav.Select>
          )}
          {utsendingsvilkår.oppfylt === false && !pending && bestemmelseErGyldig && (
            <>
              {konvensjonStorbritanniaToggleEnabled ? (
                <Mui.ListevelgerFlervalg
                  muligeValg={hentBegrunnelser()}
                  label="Legg til begrunnelse for at utsendingsbestemmelse ikke er oppfylt"
                  tillatFritekst={false}
                  onChange={(event: ListevelgerFlervalgEvent) =>
                    handleEndreBegrunnelse(event, finnFeltNavn(utsendingsvilkår?.vilkaar))
                  }
                  defaultElementer={utsendingsvilkår.begrunnelseKoder}
                  disabled={!redigerbart}
                />
              ) : (
                <Nav.Fieldset legend={`Begrunnelse artikkel ${vilkaarNavn12}:`}>
                  <Mui.ListevelgerFlervalg
                    muligeValg={begrunnelserUtsending}
                    label="Legg til begrunnelse for ikke oppfylt:"
                    tillatFritekst={false}
                    onChange={(event: ListevelgerFlervalgEvent) =>
                      handleEndreBegrunnelse(event, finnFeltNavn(FO_883_2004_ART12))
                    }
                    defaultElementer={utsendingsvilkår.begrunnelseKoder}
                    disabled={!redigerbart}
                  />
                </Nav.Fieldset>
              )}
            </>
          )}
          {unntaksvilkår.oppfylt === false && !pending && (
            <>
              {konvensjonStorbritanniaToggleEnabled ? (
                <>
                  <Mui.ListevelgerFlervalg
                    muligeValg={MKV.KTObjects.begrunnelser.art16_1_avslag}
                    label="Legg til begrunnelse for at unntaksbestemmelse ikke er oppfylt"
                    tillatFritekst={false}
                    onChange={(event: ListevelgerFlervalgEvent) =>
                      handleEndreBegrunnelse(event, `${finnFeltNavn(unntaksvilkår?.vilkaar)}_avslag`)
                    }
                    defaultElementer={unntaksvilkår.begrunnelseKoder}
                    disabled={!redigerbart}
                  />
                  {visFritekstfelt && (
                    <Nav.Textarea
                      id={`${finnFeltNavn(unntaksvilkår?.vilkaar)}_avslag`}
                      label="Begrunnelse for avslag (fritekst)"
                      maxLength={255}
                      bredde="fullbredde"
                      value={unntaksvilkår.begrunnelseFritekst || ""}
                      onChange={handleEndreFritekst}
                      disabled={!redigerbart}
                    />
                  )}
                </>
              ) : (
                <Nav.Fieldset legend="Begrunnelse artikkel 16.1:">
                  <Mui.ListevelgerFlervalg
                    muligeValg={MKV.KTObjects.begrunnelser.art16_1_avslag}
                    label="Legg til begrunnelse for avslag:"
                    tillatFritekst={false}
                    onChange={(event: ListevelgerFlervalgEvent) => handleEndreBegrunnelse(event, "art16_1_avslag")}
                    defaultElementer={unntaksvilkår.begrunnelseKoder}
                    disabled={!redigerbart}
                  />
                  {visFritekstfelt && (
                    <Nav.Textarea
                      id="art16_1_avslag"
                      label="Begrunnelse for avslag (fritekst):"
                      maxLength={255}
                      bredde="fullbredde"
                      value={unntaksvilkår.begrunnelseFritekst || ""}
                      onChange={handleEndreFritekst}
                      disabled={!redigerbart}
                    />
                  )}
                </Nav.Fieldset>
              )}
            </>
          )}
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

export default Bestemmelser;
