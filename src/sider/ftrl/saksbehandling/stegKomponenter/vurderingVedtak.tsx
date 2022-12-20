import React, { useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { Medlemskapsperiode } from "Domene";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Ikoner from "../../../../resources/images";
import * as Skjema from "../../../../felleskomponenter/skjema";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { medlemskapsperioderSelectors } from "../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { oppsummertfaktaSelectors } from "../../../../ducks/oppsummertfakta";
import { kontrollOperations } from "../../../../ducks/kontroll";
import { formSelectors } from "../../../../ducks/form";

import MottakerTabell from "../../../../felleskomponenter/tabell/mottakerTabell";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import PdfLenkeListe from "../../../../felleskomponenter/pdfLenkeListe";
import { LonnsforholdErNorgeEllerDelt, LonnsforholdErUtlandetEllerDelt } from "./selectors";
import { RepresentantformValues } from "./vurderingRepresentant";

import "./vurderingVedtak.css";
import { vedtakOperations } from "../../../../ducks/vedtak";
import vurdering_vedtak from "./vurderingVedtakSchema";
import { lagYupToReduxformErrorMapper } from "../../../../yup";

const { trygdeavtale_myndighetsland } = MKV.Koder;
const { INNVILGELSE_FOLKETRYGDLOVEN_2_8 } = MKV.Koder.brev.produserbaredokumenter;

const betalingsintervaller: KTObject[] = [
  { kode: "MANEDLIG", term: "Månedlig" },
  { kode: "KVARTAL", term: "Kvartal" },
];

const mapStateToProps = (state: RootState) => ({
  medfolgendeFamilie: oppsummertfaktaSelectors.MedfolgendeFamilieSelector(state) || [],
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  medlemskapsperioder: medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
  soknadsland: mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
  trygdeavgiftFormValues: formSelectors.VurderTrygdeavgiftFormSelector(state).values,
  skalBetaleTrygdeavgiftTilNorge: LonnsforholdErNorgeEllerDelt(state),
  skalBetaleTrygdeavgiftTilUtlandet: LonnsforholdErUtlandetEllerDelt(state),
  familieFormValues: formSelectors.VurderFamilieFormSelector(state).values,
  vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
  formValues: getFormValues(KV.Form.FTRL_VEDTAK)(state),
  formValuesRepresentant: getFormValues(KV.Form.REPRESENTANT)(state) as RepresentantformValues,
  initialValues: {
    begrunnelseFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
    innledningFritekst: behandlingsresultatSelectors.InnledningFritekstSelector(state),
  },
  formIsValid: formSelectors.FolketrygdlovenVedtakFormValidSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  kontrollerFerdigbehandling: (data: Api.Kontroll.FerdigbehandlingKontrollData) =>
    dispatch(kontrollOperations.kontrollerFerdigbehandling(data)),
  fattVedtak: (behandlingID: number, body: Api.Saksflyt.Vedtak.FattVedtakFTRLReqDto) =>
    dispatch(vedtakOperations.fatt(behandlingID, body)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  innledningFritekst?: string;
  betalingsintervall?: undefined;
  begrunnelseFritekst?: string;
}

interface Props {
  bekreft: () => void;
  oppdater: () => void;
  tilbake: () => void;
  redigerbart: boolean;
  alleLandkoder: KTObject[];
  formValues: FormValuesProps;
  harFeilmeldinger: boolean;
  aktivtSteg: boolean;
  validerMottatteOpplysninger: () => Promise<any>;
}

const VurderingVedtak = ({
  behandlingID,
  tilbake,
  redigerbart,
  medlemskapsperioder,
  innvilgelsesResultater,
  formValues,
  formValuesRepresentant,
  medfolgendeFamilie,
  soknadsland,
  alleLandkoder,
  trygdeavgiftFormValues,
  skalBetaleTrygdeavgiftTilNorge,
  skalBetaleTrygdeavgiftTilUtlandet,
  familieFormValues,
  vedtakstype,
  kontrollerFerdigbehandling,
  harFeilmeldinger,
  aktivtSteg,
  validerMottatteOpplysninger,
  fattVedtak,
  formIsValid,
}: Props & PropsFromRedux) => {
  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [oppdaterFoerKontroll, setOppdaterFoerKontroll] = useState(true);
  const [vedtakPending, setVedtakPending] = useState(false);
  const stegErGyldig = redigerbart && !harFeilmeldinger;

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

  /* Mottakere settes av backend og følger regler:
      TODO: BRUKER_FÅR_KOPI_HVIS_FULLMEKTIG_FINNES,
      ARBEIDSGIVER_FÅR_KOPI_HVIS_IKKE_SELVBETALENDE_BRUKER,
      TODO: SKATT_FÅR_KOPI_HVIS_AVGIFTSPLIKTIG_INNTEKT
    Burde derfor hente mottakere på nytt når disse dataene endres.
   */
  const debouncedHentMuligeMottakere = useCallback(Utils._debounce(hentMuligeMottakere, 2000), []);
  useEffect(() => {
    debouncedHentMuligeMottakere();
    return debouncedHentMuligeMottakere.cancel();
  }, [formValuesRepresentant.selvbetalende]);

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

  function mapPeriodeRader(perioder: Medlemskapsperiode[] | undefined) {
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
        sendesTilDokumenterV2: true,
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
          kopiMottakere: [],
          innledningFritekst: formValues?.innledningFritekst || null,
          begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
          orgNr: muligMottaker?.orgnr || null,
          ektefelleFritekst: familieFormValues?.ektefelle_samboer?.fritekst || null,
          barnFritekst: familieFormValues?.barn?.fritekst || null,
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

  function getTrygdeavgiftString(sentence: string, boldWord: string) {
    if (!sentence) return null;
    const part1 = sentence.slice(0, sentence.indexOf(boldWord));
    const part2 = sentence.slice(sentence.indexOf(boldWord) + boldWord.length, sentence.length);
    return (
      <>
        {part1}
        <b>{boldWord}</b>
        {part2}
      </>
    );
  }

  const lagFattVedtakFTRLReqDto = () => {
    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.MEDLEM_I_FOLKETRYGDEN,
      innledningFritekst: formValues?.innledningFritekst || null,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      ektefelleFritekst: familieFormValues?.ektefelle_samboer?.fritekst || null,
      barnFritekst: familieFormValues?.barn?.fritekst || null,
      betalingsintervall: formValues.betalingsintervall ?? "MANEDLIG",
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
      if (aktivtSteg) {
        setVedtakPending(true);
        await kontrollerFerdigbehandling(lagKontrollerFerdigbehandlingDto());
        setOppdaterFoerKontroll(false);
        setVedtakPending(false);
      }
    }

    kontroller();
  }, [aktivtSteg]);

  const onSubmit = async () => {
    setVedtakPending(true);

    validerMottatteOpplysninger()
      .then(() => {
        fattVedtak(behandlingID, lagFattVedtakFTRLReqDto()).then((res) => {
          if (res.data?.data?.error) {
            setVedtakPending(false);
          }
        });
      })
      .catch(() => setVedtakPending(false));
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

  return (
    <div className="vurderingVedtak">
      <Nav.Typo.Undertittel className="undertittel">Frivillig medlemskap etter paragraf 2.8</Nav.Typo.Undertittel>

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

      {skalBetaleTrygdeavgiftTilNorge && (
        <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
          <Ikoner.Inntekt className="trygdeavgift_ikon" focusable={false} />
          <Nav.Typo.Normaltekst>
            {getTrygdeavgiftString(
              KV.finnTermFraListe(
                MKV.KTObjects.vurderingsutfall_trygdeavgift_norsk_inntekt,
                trygdeavgiftFormValues.avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt
              ),
              "norsk inntekt"
            )}
          </Nav.Typo.Normaltekst>
        </div>
      )}
      {skalBetaleTrygdeavgiftTilUtlandet && (
        <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
          <Ikoner.Inntekt className="trygdeavgift_ikon" focusable={false} />
          <Nav.Typo.Normaltekst>
            {getTrygdeavgiftString(
              KV.finnTermFraListe(
                MKV.KTObjects.vurderingsutfall_trygdeavgift_utenlandsk_inntekt,
                trygdeavgiftFormValues.avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt
              ),
              "utenlandsk inntekt"
            )}
          </Nav.Typo.Normaltekst>
        </div>
      )}

      <div style={{ marginTop: "0.5rem", marginLeft: "0.5rem", marginBottom: "0.5rem" }}>
        <Nav.Row>
          <Nav.Column xs="4">
            <Skjema.Select label="Betalingsintervall" feltNavn="betalingsintervall">
              {betalingsintervaller.map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Skjema.Select>
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
      <Skjema.HTMLEditor
        feltNavn="innledningFritekst"
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
      <Skjema.HTMLEditor
        feltNavn="begrunnelseFritekst"
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

const VurderingVedtakForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.FTRL_VEDTAK,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values) => lagYupToReduxformErrorMapper(vurdering_vedtak)(values),
})(VurderingVedtak);

export default connector(VurderingVedtakForm);
