import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import {
  konverterLovvalgsbestemmelseTilStegData,
  konverterTilleggBestemmelseTilStegData,
  konverterVilkarTilStegData,
  lagLovvalgsbestemmelseIAlleSteg,
  lagTilleggBestemmelse,
  lagVilkaar,
  lagVilkarbegrunnelse,
  slettLovvalgsbestemmelse,
  slettTilleggBestemmelse,
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
  finnTilleggsbestemmelse,
  hentRelevantUtsendelseArtikkel12,
  hentRelevantUtsendelseArtikkel14,
  hentRelevantUtsendelseArtikkel16,
  initializeVedtakValg,
  VedtakValg,
} from "./bestemmelserUtils";
import { anmodningsperioderSelectors } from "../../../../ducks/anmodningsperioder";

const { FO_883_2004_ART16_1, KONV_EFTA_STORBRITANNIA_ART18_1 } = MKV.Koder.vilkaar;
const { SAERLIG_AVSLAGSGRUNN } = MKV.Koder.begrunnelser.avslag_anmodning_begrunnelser;

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
  const lovvalgsperiodeBestemmelse = useSelector(lovvalgsperioderSelectors.LovvalgBestemmelseSelector);
  const lovvalgsperiodeTilleggsbestemmelse = useSelector(lovvalgsperioderSelectors.TilleggBestemmelseSelector);
  const anmodningsperiodeBestemmelse = useSelector(anmodningsperioderSelectors.LovvalgsbestemmelseSelector);
  const anmodningsperiodeTilleggsbestemmelse = useSelector(anmodningsperioderSelectors.TilleggsbestemmelseSelector);
  const lovvalgsbestemmelse = lovvalgsperiodeBestemmelse ?? anmodningsperiodeBestemmelse;
  const tilleggsbestemmelse = lovvalgsperiodeTilleggsbestemmelse ?? anmodningsperiodeTilleggsbestemmelse;
  const yrkesgruppeFakta = useSelector(avklartefaktaSelectors.YrkesgruppeSelector);
  const arbeidPåSkipFakta = useSelector(avklartefaktaSelectors.ArbeidSokkelSkipSelector);
  const utsendingsvilkår: Partial<Vilkaar> = useSelector(vilkarSelectors.UtsendingsvilkårSelector);
  const unntaksvilkår: Partial<Vilkaar> = useSelector(vilkarSelectors.UnntaksvilkårSelector);
  const erSokkel = useSelector(avklartefaktaSelectors.InstallasjonsTypeSelector) === KV.Koder.SOKKEL;

  const [vedtakValg, setVedtakValg] = useState(initializeVedtakValg(utsendingsvilkår, unntaksvilkår));
  const [bestemmelse, setBestemmelse] = useState(lovvalgsbestemmelse ?? "");
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
    if (konvensjonStorbritanniaToggleEnabled && lovvalgsbestemmelse) {
      oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));
    }
    if (konvensjonStorbritanniaToggleEnabled && tilleggsbestemmelse) {
      oppdaterData(konverterTilleggBestemmelseTilStegData(tilleggsbestemmelse));
    }
  }, []);

  useEffect(() => {
    const nyTilleggsbestemmelse = finnTilleggsbestemmelse(lovvalgsbestemmelse, yrkesgruppeFakta, arbeidPåSkipFakta);
    if (
      redigerbart &&
      konvensjonStorbritanniaToggleEnabled &&
      lovvalgsbestemmelse &&
      vedtakValg &&
      nyTilleggsbestemmelse !== tilleggsbestemmelse
    ) {
      slettData(slettTilleggBestemmelse());
      if (nyTilleggsbestemmelse) oppdaterData(lagTilleggBestemmelse(nyTilleggsbestemmelse));
    }
  }, [yrkesgruppeFakta, arbeidPåSkipFakta]);

  const slettAlleVilkår = () => alleRelevanteFeltNavn.forEach((feltNavn) => slettData(slettVilkar(feltNavn)));

  const handleEndreVedtakValg = (value: VedtakValg) => {
    setPending(true);
    setVedtakValg(value);
    setBestemmelse("");

    if (konvensjonStorbritanniaToggleEnabled) {
      slettAlleVilkår();
      slettData(slettTilleggBestemmelse());
      slettData(slettLovvalgsbestemmelse());
      if (value === VedtakValg.JA_INNVILGE) {
        if (!visStorbritanniaKonvensjon) handleEndreBestemmelse(FO_883_2004_ART12, value);
        setPending(false);
      } else if (value === VedtakValg.NEI_ANMODNING_UNNTAK) {
        if (!visStorbritanniaKonvensjon) handleEndreBestemmelse(FO_883_2004_ART16_1, value);
        setPending(false);
      } else if (value === VedtakValg.NEI_AVSLAG) {
        oppdaterData(lagVilkaar(finnFeltNavn(FO_883_2004_ART12), false));
        oppdaterData(lagVilkaar("art16_1_avslag", false));
        setTimeout(() => setPending(false), 100);
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
      setPending(false);
    }
  };

  const finnUtsendelsevilkår = (unntaksvilkårKode: string) => {
    if (unntaksvilkårKode === FO_883_2004_ART16_1) return FO_883_2004_ART12;
    return erSokkel ? KONV_EFTA_STORBRITANNIA_ART16 : KONV_EFTA_STORBRITANNIA_ART14;
  };

  const handleEndreBestemmelse = (nyBestemmelse: string, valgtVedtak = vedtakValg) => {
    setPending(true);
    if (bestemmelse) {
      slettAlleVilkår();
    }
    setBestemmelse(nyBestemmelse);

    if (valgtVedtak === VedtakValg.JA_INNVILGE) {
      const utsendelsevilkårFeltNavn = finnFeltNavn(nyBestemmelse);
      oppdaterData(lagVilkaar(utsendelsevilkårFeltNavn, true));
      const nyTilleggsbestemmelse = finnTilleggsbestemmelse(nyBestemmelse, yrkesgruppeFakta, arbeidPåSkipFakta);
      if (nyTilleggsbestemmelse) oppdaterData(lagTilleggBestemmelse(nyTilleggsbestemmelse));
    }
    if (valgtVedtak === VedtakValg.NEI_ANMODNING_UNNTAK) {
      const utsendelsevilkår = finnUtsendelsevilkår(nyBestemmelse);
      const unntaksvilkårFeltNavn = finnFeltNavn(nyBestemmelse);
      oppdaterData(lagVilkaar(finnFeltNavn(utsendelsevilkår), false));
      oppdaterData(lagVilkaar(`${unntaksvilkårFeltNavn}_anmodning`, true));
    }

    oppdaterData(lagLovvalgsbestemmelseIAlleSteg(nyBestemmelse));

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
            MKVUtils.lovvalgsbestemmelseTilObjekt(
              erSokkel ? KONV_EFTA_STORBRITANNIA_ART16 : KONV_EFTA_STORBRITANNIA_ART14
            ),
            MKVUtils.lovvalgsbestemmelseTilObjekt(FO_883_2004_ART12),
          ]
        : [MKVUtils.lovvalgsbestemmelseTilObjekt(FO_883_2004_ART12)];
    }
    if (anmodningOmUnntak) {
      return visStorbritanniaKonvensjon
        ? [
            MKVUtils.lovvalgsbestemmelseTilObjekt(KONV_EFTA_STORBRITANNIA_ART18_1),
            MKVUtils.lovvalgsbestemmelseTilObjekt(FO_883_2004_ART16_1),
          ]
        : [MKVUtils.lovvalgsbestemmelseTilObjekt(FO_883_2004_ART16_1)];
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
          <Nav.RadioGroup
            legend={
              konvensjonStorbritanniaToggleEnabled
                ? "Fyller bruker kriteriene for utsendingsbestemmelsen?"
                : `Fyller bruker kriteriene for artikkel ${vilkaarNavn12}?`
            }
            onChange={handleEndreVedtakValg}
            defaultValue={vedtakValg}
            readOnly={!redigerbart}
            name="vedtakvalg"
          >
            <Nav.Radio value={VedtakValg.JA_INNVILGE}>
              {konvensjonStorbritanniaToggleEnabled ? "Ja, jeg vil innvilge søknaden" : "Ja"}
            </Nav.Radio>
            <Nav.Radio value={VedtakValg.NEI_ANMODNING_UNNTAK}>
              {konvensjonStorbritanniaToggleEnabled
                ? "Nei, jeg vil vurdere anmodning om unntak"
                : "Nei, jeg vil vurdere artikkel 16.1"}
            </Nav.Radio>
            <Nav.Radio value={VedtakValg.NEI_AVSLAG}>
              {konvensjonStorbritanniaToggleEnabled
                ? `Nei, jeg vil avslå søknaden etter artikkel ${vilkaarNavn12} og 16.1 (kun EØS-forordningen)`
                : `Nei, jeg vil avslå søknaden etter artikkel ${vilkaarNavn12} og 16.1`}
            </Nav.Radio>
          </Nav.RadioGroup>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12" md="10" lg="8">
          {konvensjonStorbritanniaToggleEnabled && (innvilgelse || anmodningOmUnntak) && (
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
                    muligeValg={MKV.KTObjects.begrunnelser.avslag_anmodning_begrunnelser}
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
                    muligeValg={MKV.KTObjects.begrunnelser.avslag_anmodning_begrunnelser}
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
