import React, { useState } from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";
import { Medlemskapsperiode } from "Domene";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../utils/navFrontend";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Hooks from "../../../../hooks";
import * as Ikoner from "../../../../resources/images";
import * as Skjema from "../../../skjema";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { medlemskapsperioderSelectors } from "../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { behandlingsgrunnlagSelectors } from "../../../../ducks/behandlingsgrunnlag";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { oppsummertfaktaSelectors } from "../../../../ducks/oppsummertfakta";
import { formSelectors } from "../../../../ducks/form";
import { BOOLSK } from "../../../../constants";
import MottakerTabell from "../../../tabell/mottakerTabell";
import PdfLenkeListe from "../../../pdfLenkeListe";

import "./vurderingVedtak.css";

const { avtaleland } = MKV.Koder;
const { INNVILGELSE_FOLKETRYGDLOVEN_2_8 } = MKV.Koder.brev.produserbaredokumenter;

const mapStateToProps = (state: RootState) => ({
  medfolgendeFamilie: oppsummertfaktaSelectors.MedfolgendeFamilieSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  medlemskapsperioder: medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
  soknadsland: behandlingsgrunnlagSelectors.SoknadslandkoderSelector(state),
  trygdeavgiftFormValues: formSelectors.VurderTrygdeavgiftFormSelector(state).values,
  familieFormValues: formSelectors.VurderFamilieFormSelector(state).values,
  vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
  formValues: getFormValues(KV.Form.FTRL_VEDTAK)(state),
  initialValues: {
    fritekstBegrunnelse: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
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
    fritekstInnledning?: string;
    fritekstBegrunnelse?: string;
  };
}

const VurderingVedtak = ({
  behandlingID,
  tilbake,
  redigerbart,
  medlemskapsperioder,
  innvilgelsesResultater,
  formValues,
  medfolgendeFamilie,
  soknadsland,
  alleLandkoder,
  trygdeavgiftFormValues,
  familieFormValues,
  lagreOgFatteVedtak,
  vedtakstype,
}: Props & PropsFromRedux) => {
  const [muligeMottakere, setMuligeMottakere] = Hooks.useAsyncCallbackState(
    () =>
      Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
        produserbartdokument: INNVILGELSE_FOLKETRYGDLOVEN_2_8,
        orgnr: null,
      }),
    Api.DokumenterV2.tomHentMuligeMottakereResDto(),
    []
  );
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
          innledningFritekst: formValues?.fritekstInnledning,
          begrunnelseFritekst: formValues?.fritekstBegrunnelse,
          orgNr: muligMottaker?.orgnr,
        },
      },
    ];
  };

  const mapRad = (muligMottaker: Api.DokumenterV2.MuligMottaker, kanSlettes: boolean) => {
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
        verdi: kanSlettes ? sletteknapp : <></>,
        style: "slettKnapp",
      },
    ];
  };

  const mapMottakerRader = (mottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return [
      mapRad(mottakere.hovedMottaker, false),
      ...mottakere.kopiMottakere.map((muligMottaker) => mapRad(muligMottaker, true)),
      ...mottakere.fasteMottakere.map((muligMottaker) => mapRad(muligMottaker, false)),
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

  const trygdeavgiftTilNorge = [MKV.Koder.loenn_forhold.LØNN_FRA_NORGE, MKV.Koder.loenn_forhold.DELT_LØNN].includes(
    trygdeavgiftFormValues?.avgiftsgrunnlag?.lønnsforhold
  );
  const trygdeavgiftTilUtlandet = [
    MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET,
    MKV.Koder.loenn_forhold.DELT_LØNN,
  ].includes(trygdeavgiftFormValues?.avgiftsgrunnlag?.lønnsforhold);

  const fattVedtak = async () => {
    setVedtakPending(true);

    await lagreOgFatteVedtak({
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekstInnledning: formValues?.fritekstInnledning || null,
      fritekstBegrunnelse: formValues?.fritekstBegrunnelse || null,
      fritekstEktefelle: familieFormValues?.ektefelle_samboer?.fritekst || null,
      fritekstBarn: familieFormValues?.barn?.fritekst || null,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      kopiMottakere: [],
    });

    if (isMounted.current) {
      setVedtakPending(false);
    }
  };

  const soknadslandErEtAvtaleland = avtaleland[soknadsland?.toString()] !== undefined;

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
          <Nav.Typo.Normaltekst className="info">
            {medfolgendeFamilie?.every((familie) => familie.omfattet === BOOLSK.SANN) ? "Ja" : "Nei"}
          </Nav.Typo.Normaltekst>
        </Nav.Column>
      </Nav.Row>

      {trygdeavgiftTilNorge && (
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
      {trygdeavgiftTilUtlandet && (
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

      {redigerbart && (
        <>
          <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
            Fritekst til innledning <Nav.Hjelpetekst className="hjelpetekst" type={Nav.PopoverOrientering.Hoyre} />
          </Nav.Typo.Element>
          <Skjema.HTMLEditor
            feltNavn="fritekstInnledning"
            className="fritekst_editor"
            placeholder="Skriv inn tilleggsinformasjon til innledning..."
          />
        </>
      )}

      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        Fritekst til begrunnelse <Nav.Hjelpetekst className="hjelpetekst" type={Nav.PopoverOrientering.Hoyre} />
      </Nav.Typo.Element>
      <Skjema.HTMLEditor
        feltNavn="fritekstBegrunnelse"
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

      <div className="fane__knapplinje">
        <Nav.Knapp mini disabled={!redigerbart} className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp
          mini
          disabled={!redigerbart}
          className="fane__navigasjonsknapp"
          onClick={fattVedtak}
          spinner={vedtakPending}
          autoDisableVedSpinner
        >
          Fatt vedtak
        </Nav.Hovedknapp>
      </div>
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
