import React, { useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";
import { Medlemskapsperiode } from "Domene";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Hooks from "../../../../hooks";
import * as Ikoner from "../../../../resources/images";
import * as Skjema from "../../../../felleskomponenter/skjema";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { medlemskapsperioderSelectors } from "../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { behandlingsgrunnlagSelectors } from "../../../../ducks/behandlingsgrunnlag";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { oppsummertfaktaSelectors } from "../../../../ducks/oppsummertfakta";
import { formSelectors } from "../../../../ducks/form";
import MottakerTabell from "../../../../felleskomponenter/tabell/mottakerTabell";
import { LonnsforholdErNorgeEllerDelt, LonnsforholdErUtlandetEllerDelt } from "./selectors";
import PdfLenkeListe from "../../../../felleskomponenter/pdfLenkeListe";
import { RepresentantformValues } from "./vurderingRepresentant";

import "./vurderingVedtak.css";

const { avtaleland } = MKV.Koder;
const { INNVILGELSE_FOLKETRYGDLOVEN_2_8 } = MKV.Koder.brev.produserbaredokumenter;

const mapStateToProps = (state: RootState) => ({
  medfolgendeFamilie: oppsummertfaktaSelectors.MedfolgendeFamilieSelector(state) || [],
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  medlemskapsperioder: medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
  soknadsland: behandlingsgrunnlagSelectors.SoknadslandkoderSelector(state),
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
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void;
  oppdater: () => void;
  tilbake: () => void;
  lagreOgFatteVedtak: (data: Api.Saksflyt.Vedtak.FattVedtakFTRLReqDto) => void;
  redigerbart: boolean;
  alleLandkoder: KTObject[];
  formValues: {
    innledningFritekst?: string;
    begrunnelseFritekst?: string;
  };
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
  lagreOgFatteVedtak,
  vedtakstype,
}: Props & PropsFromRedux) => {
  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());

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
  }, [formValuesRepresentant.selvbetalende]);

  const [vedtakPending, setVedtakPending] = useState(false);
  const isMounted = Hooks.useIsMounted();

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

  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker, ikon?: boolean) => [
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

  const mapMottakerRader = (mottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => [
    mapMottakerRad(mottakere.hovedMottaker, false),
    ...mottakere.kopiMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker, true)),
    ...mottakere.fasteMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker, false)),
  ];

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

  const fattVedtak = async () => {
    setVedtakPending(true);

    await lagreOgFatteVedtak({
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.MEDLEM_I_FOLKETRYGDEN,
      innledningFritekst: formValues?.innledningFritekst || null,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      ektefelleFritekst: familieFormValues?.ektefelle_samboer?.fritekst || null,
      barnFritekst: familieFormValues?.barn?.fritekst || null,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
    });

    if (isMounted.current) {
      setVedtakPending(false);
    }
  };

  const soknadslandErEtAvtaleland = avtaleland[soknadsland?.toString()] !== undefined;

  const innledningFritekstHjelpetekstTittel =
    "Teksten du skriver her vil vises etter informasjonen om vedtakets periode og resultat. Eksempel: Du er medlem i folketrygden fra 1. september 2022 til 31. desember 2024. Medlemskapet omfatter trygdedekning i folketrygdens helse- og pensjonsdel. Friteksten kommer her.";
  const begrunnelseFritekstHjelpetekstTittel =
    "Teksten du skriver her vil vises etter standard begrunnelse for bestemmelsen.  Eksempel: Du har opplyst at du arbeider for Equinor ASA i Brasil. Vi har lagt til grunn at du er ansatt i en virksomhet med hovedsete i Norge. Friteksten kommer her.";

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

      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        Fritekst til innledning
        <Nav.Hjelpetekst
          tittel={innledningFritekstHjelpetekstTittel}
          className="hjelpetekst"
          type={Nav.PopoverOrientering.Hoyre}
        >
          <p>Teksten du skriver her vil vises etter informasjonen om vedtakets periode og resultat. Eksempel:</p>
          <p>&quot;Du er medlem i folketrygden fra 1. september 2022 til 31. desember 2024.</p>
          <p>Medlemskapet omfatter trygdedekning i folketrygdens helse- og pensjonsdel.&quot;</p>
          <p>Friteksten kommer her.</p>
        </Nav.Hjelpetekst>
      </Nav.Typo.Element>
      <Skjema.HTMLEditor
        feltNavn="innledningFritekst"
        className="fritekst_editor"
        placeholder="Skriv inn tilleggsinformasjon til innledning..."
        disabled={!redigerbart}
      />

      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        Fritekst til begrunnelse{" "}
        <Nav.Hjelpetekst
          tittel={begrunnelseFritekstHjelpetekstTittel}
          className="hjelpetekst"
          type={Nav.PopoverOrientering.Hoyre}
        >
          <p>Teksten du skriver her vil vises etter standard begrunnelse for bestemmelsen. Eksempel:</p>
          <p>&quot;Du har opplyst at du arbeider for Equinor ASA i Brasil.</p>
          <p>Vi har lagt til grunn at du er ansatt i en virksomhet med hovedsete i Norge.&quot;</p>
          <p>Friteksten kommer her.</p>
        </Nav.Hjelpetekst>
      </Nav.Typo.Element>
      <Skjema.HTMLEditor
        feltNavn="begrunnelseFritekst"
        className="fritekst_editor"
        placeholder="Skriv inn tilleggsinformasjon til begrunnelse..."
        disabled={!redigerbart}
      />

      {redigerbart && (
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
          onClick: fattVedtak,
          disabled: !redigerbart,
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
})(VurderingVedtak);

export default connector(VurderingVedtakForm);
