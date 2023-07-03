import React, { useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Ikoner from "../../../../resources/images";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { medlemskapsperioderSelectors } from "../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { oppsummertfaktaSelectors } from "../../../../ducks/oppsummertfakta";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { landkoderSelectors } from "../../../../ducks/landkoder";
import { kontrollOperations } from "../../../../ducks/kontroll";
import { vedtakOperations } from "../../../../ducks/vedtak";
import { formSelectors } from "../../../../ducks/form";

import MottakerTabell from "../../../../felleskomponenter/tabell/mottakerTabell";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import PdfLenkeListe from "../../../../felleskomponenter/pdfLenkeListe";

import vurdering_vedtak from "./vurderingVedtakSchema";
import "./vurderingVedtak.css";

const { trygdeavtale_myndighetsland } = MKV.Koder;
const { INNVILGELSE_FOLKETRYGDLOVEN_2_8 } = MKV.Koder.brev.produserbaredokumenter;

const betalingsintervaller: KTObject[] = [
  { kode: "MANEDLIG", term: "Månedlig" },
  { kode: "KVARTAL", term: "Kvartal" },
];

const komponentState = (state: RootState) => ({
  medfolgendeFamilie: oppsummertfaktaSelectors.MedfolgendeFamilieSelector(state) || [],
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  medlemskapsperioder: medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
  soknadsland: mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
  mottatteOpplysningerFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
  initialValues: {
    begrunnelseFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state) || "",
    innledningFritekst: behandlingsresultatSelectors.InnledningFritekstSelector(state) || "",
    betalingsintervall: "MANEDLIG",
  },
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  alleLandkoder: landkoderSelectors.LandkoderSelector(state),
  mottatteOpplysningerStatus: mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector(state),
});

const komponentDispatch = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  kontrollerFerdigbehandling: (data: Api.Kontroll.FerdigbehandlingKontrollData) =>
    dispatch(kontrollOperations.kontrollerFerdigbehandling(data)),
  fattVedtak: (behandlingID: number, body: Api.Saksflyt.Vedtak.FattVedtakFTRLReqDto) =>
    dispatch(vedtakOperations.fatt(behandlingID, body)),
});

interface FormValuesProps {
  innledningFritekst?: string;
  betalingsintervall?: undefined;
  begrunnelseFritekst?: string;
}

interface Props {
  tilbake: () => void;
  aktivtSteg: boolean;
}

export const VurderingVedtak = ({ tilbake, aktivtSteg }: Props) => {
  const dispatch = useDispatch();

  const { kontrollerFerdigbehandling, fattVedtak } = komponentDispatch(dispatch);
  const {
    medfolgendeFamilie,
    behandlingID,
    medlemskapsperioder,
    innvilgelsesResultater,
    soknadsland,
    mottatteOpplysningerFeilmeldinger,
    vedtakstype,
    initialValues,
    alleLandkoder,
    redigerbart,
    mottatteOpplysningerStatus,
  } = useSelector(komponentState);

  const {
    watch,
    control,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurdering_vedtak),
    defaultValues: {
      ...initialValues,
    } as FieldValues,
  });
  const formValues = watch();

  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [oppdaterFoerKontroll, setOppdaterFoerKontroll] = useState(true);
  const [vedtakPending, setVedtakPending] = useState(false);
  const stegErGyldig = redigerbart && formIsValid;

  const mottatteOpplysningerErGyldig = () => Utils._isEmpty(mottatteOpplysningerFeilmeldinger);

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: INNVILGELSE_FOLKETRYGDLOVEN_2_8,
      orgnr: null,
    });
    setMuligeMottakere(res);
  };

  useEffect(() => {
    hentMuligeMottakere();
  }, []);

  const oppdaterFritekster = (values: FormValuesProps) => {
    if (values && redigerbart && !vedtakPending) {
      Api.Behandlinger.resultat.oppdatererFritekster(behandlingID, {
        innledningFritekst: values.innledningFritekst,
        begrunnelseFritekst: values.begrunnelseFritekst,
      });
    }
  };

  const debouncedOppdaterFritekster = useCallback(Utils._debounce(oppdaterFritekster, 1000), []);

  useEffect(() => {
    debouncedOppdaterFritekster(formValues);
    return debouncedOppdaterFritekster.cancel();
  }, [formValues?.innledningFritekst, formValues?.begrunnelseFritekst]);

  function mapPeriodeRader(perioder: Api.Medlemskapsperioder.Medlemskapsperiode[] | undefined) {
    return perioder
      ? perioder.map((medlemskapsperiode) => [
          {
            verdi: `Fra. ${Utils.dato.formatterDatoTilNorsk(
              medlemskapsperiode.fomDato
            )} Til. ${Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato)}`,
          },
          { verdi: KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, medlemskapsperiode.trygdedekning) },
          { verdi: KV.finnTermFraListe(innvilgelsesResultater, medlemskapsperiode.innvilgelsesResultat) },
        ])
      : [];
  }

  const slettKopiMottaker = (kopiMottaker: Api.DokumenterV2.MuligMottaker) => {
    if (!muligeMottakere) return;
    setMuligeMottakere({
      ...muligeMottakere,
      kopiMottakere: muligeMottakere.kopiMottakere.filter((mottaker) => mottaker !== kopiMottaker),
    });
  };

  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker, ikon?: boolean) => {
    return [
      {
        navn: ikon ? (
          <>
            <Ikoner.Forhandsvis />
            <span className="sr-only">Forhåndsvis dokument {muligMottaker.dokumentNavn}</span>
          </>
        ) : (
          muligMottaker.dokumentNavn
        ),
        data: {
          produserbardokument: INNVILGELSE_FOLKETRYGDLOVEN_2_8,
          mottaker: muligMottaker.rolle,
          innledningFritekst: formValues?.innledningFritekst || null,
          begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
          orgNr: muligMottaker?.orgnr || null,
        },
      },
    ];
  };

  const mapMottakerRad = (muligMottaker: Api.DokumenterV2.MuligMottaker, kanSlettes: boolean) => {
    const sletteknapp = (
      <Nav.Knapp type="flat" form="kompakt" onClick={() => slettKopiMottaker(muligMottaker)}>
        <Ikoner.Bin />
        <span className="sr-only">Slett dokument {muligMottaker.dokumentNavn}</span>
      </Nav.Knapp>
    );

    return [
      {
        verdi: (
          <PdfLenkeListe
            behandlingID={behandlingID}
            dokumenter={lagDokumenterData(muligMottaker)}
            vedKlikk={() => true}
            className="forhåndsvisning"
          />
        ),
      },
      { verdi: muligMottaker.mottakerNavn },
      {
        verdi: (
          <PdfLenkeListe
            behandlingID={behandlingID}
            dokumenter={lagDokumenterData(muligMottaker, true)}
            vedKlikk={() => true}
            className="forhåndsvisning"
          />
        ),
        style: "midtstilt",
      },
      {
        verdi: kanSlettes ? sletteknapp : null,
        style: "slettKnapp",
      },
    ];
  };

  const mapMottakerRader = (mottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return [
      mapMottakerRad(mottakere.hovedMottaker, false),
      ...mottakere.kopiMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker, true)),
      ...mottakere.fasteMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker, false)),
    ];
  };

  const lagFattVedtakFTRLReqDto = () => {
    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.MEDLEM_I_FOLKETRYGDEN,
      innledningFritekst: formValues?.innledningFritekst || null,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      betalingsintervall: formValues?.betalingsintervall,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
      nyVurderingBakgrunn: null,
    };
  };

  const lagKontrollerFerdigbehandlingDto = () => {
    return {
      behandlingID,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.MEDLEM_I_FOLKETRYGDEN,
      skalRegisteropplysningerOppdateres: oppdaterFoerKontroll,
    };
  };

  useEffect(() => {
    async function kontroller() {
      if (aktivtSteg && redigerbart && mottatteOpplysningerStatus === "OK") {
        setVedtakPending(true);
        await kontrollerFerdigbehandling(lagKontrollerFerdigbehandlingDto());
        setOppdaterFoerKontroll(false);
        setVedtakPending(false);
      }
    }

    kontroller();
  }, [aktivtSteg, redigerbart, mottatteOpplysningerStatus]);

  const onSubmit = async () => {
    setVedtakPending(true);
    if (mottatteOpplysningerErGyldig()) {
      fattVedtak(behandlingID, lagFattVedtakFTRLReqDto()).then((res) => {
        if (res.data?.data?.error) {
          setVedtakPending(false);
        }
      });
    } else {
      setVedtakPending(false);
    }
  };

  const soknadslandErEtAvtaleland = trygdeavtale_myndighetsland[soknadsland?.toString()] !== undefined;

  const innledningFritekstHjelpetekst =
    "Teksten du skriver her vil vises etter informasjonen om vedtakets periode og resultat. Eksempel: \n\n" +
    '"Du er medlem i folketrygden fra 1. september 2022 til 31. desember 2024. Medlemskapet omfatter trygdedekning i folketrygdens helse- og pensjonsdel."\n\n' +
    "Friteksten kommer her.";
  const begrunnelseFritekstHjelpetekst =
    "Teksten du skriver her vil vises etter standard begrunnelse for bestemmelsen.  Eksempel: \n\n" +
    '"Du har opplyst at du arbeider for Equinor ASA i Brasil. Vi har lagt til grunn at du er ansatt i en virksomhet med hovedsete i Norge."\n\n' +
    "Friteksten kommer her.";

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingVedtak">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Frivillig medlemskap etter paragraf 2.8
      </Nav.Typo.Innholdstittel>

      <MottakerTabell
        rader={mapPeriodeRader(medlemskapsperioder)}
        kolonner={[
          { verdi: "Periode", bredde: "42%" },
          { verdi: "Dekning", bredde: "33%" },
          { verdi: "Resultat", bredde: "23%" },
        ]}
      />

      <Nav.Row className="margin_bottom">
        <Nav.Column xs="5">
          <Nav.Typo.Element className="info">Arbeidsland</Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="info">
            {alleLandkoder ? KV.finnTermFraListe(alleLandkoder, soknadsland[0]) : "Finner ikke arbeidsland"}
          </Nav.Typo.Normaltekst>
        </Nav.Column>
        <Nav.Column xs="4">
          <Nav.Typo.Element className="info">Arbeid utføres i avtaleland</Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="info">{soknadslandErEtAvtaleland ? "Ja" : "Nei"}</Nav.Typo.Normaltekst>
        </Nav.Column>
        <Nav.Column xs="3">
          <Nav.Typo.Element className="info">Familiemedlemmer</Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="info">{medfolgendeFamilie.length > 0 ? "Ja" : "Nei"}</Nav.Typo.Normaltekst>
        </Nav.Column>
      </Nav.Row>

      <div style={{ marginTop: "0.5rem", marginLeft: "0.5rem", marginBottom: "0.5rem" }}>
        <Nav.Row>
          <Nav.Column xs="4">
            <Forms.Select
              label="Betalingsintervall"
              name="betalingsintervall"
              control={control}
              disabled={!redigerbart}
            >
              {betalingsintervaller.map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
        </Nav.Row>
      </div>

      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        <LabelMedHjelpetekst
          label="Fritekst til innledning"
          hjelpetekst={innledningFritekstHjelpetekst}
          hjelpetekstClassName="hjelpetekst"
        />
      </Nav.Typo.Element>
      <Forms.HtmlEditor
        name="innledningFritekst"
        control={control}
        className="fritekst_editor"
        placeholder="Skriv inn tilleggsinformasjon til innledning..."
        disabled={!redigerbart}
      />

      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        <LabelMedHjelpetekst
          label="Fritekst til begrunnelse"
          hjelpetekst={begrunnelseFritekstHjelpetekst}
          hjelpetekstClassName="hjelpetekst"
        />
      </Nav.Typo.Element>
      <Forms.HtmlEditor
        name="begrunnelseFritekst"
        control={control}
        className="fritekst_editor"
        placeholder="Skriv inn tilleggsinformasjon til begrunnelse..."
        disabled={!redigerbart}
      />

      {stegErGyldig && (
        <MottakerTabell
          rader={muligeMottakere ? mapMottakerRader(muligeMottakere) : []}
          kolonner={[
            { verdi: "Dokumenter", bredde: "60%" },
            { verdi: "Mottaker", bredde: "20%" },
            { verdi: "Forhåndsvis", bredde: "10%", style: "normal_font_weight midtstilt" },
            { verdi: "Slett", bredde: "10%", style: "normal_font_weight midtstilt" },
          ]}
        />
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: onSubmit,
          disabled: !stegErGyldig || !formIsValid,
          autoDisableVedSpinner: true,
          spinner: vedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
