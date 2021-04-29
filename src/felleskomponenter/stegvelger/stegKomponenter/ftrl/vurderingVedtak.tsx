import React from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";
import { Medlemskapsperiode } from "Domene";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../utils/navFrontend";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Ikoner from "../../../../resources/images";
import * as Skjema from "../../../skjema";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { medlemskapsperioderSelectors } from "../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { behandlingsgrunnlagSelectors } from "../../../../ducks/behandlingsgrunnlag";
import { formSelectors } from "../../../../ducks/form";
import MottakerTabell from "../../../tabell/mottakerTabell";

import "./vurderingVedtak.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  medlemskapsperioder: medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
  soknadsland: behandlingsgrunnlagSelectors.SoknadslandSelector(state),
  trygdeavgiftFormValues: formSelectors.VurderTrygdeavgiftFormSelector(state).values,
  formValues: getFormValues(KV.Form.FTRL_VEDTAK)(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void;
  oppdater: () => void;
  tilbake: () => void;
  tilForsiden: () => void;
  redigerbart: boolean;
  alleLandkoder: KTObject[];
  formValues: {
    fritekstInnledning?: HTMLElement;
    fritekstBegrunnelse?: HTMLElement;
  };
}

const VurderingVedtak = ({
  tilbake,
  redigerbart,
  medlemskapsperioder,
  innvilgelsesResultater,
  soknadsland,
  alleLandkoder,
  trygdeavgiftFormValues,
  tilForsiden,
}: Props & PropsFromRedux) => {
  const midlertidigStatiskPdfLinke =
    "https://melosys-dokgen.dev.adeo.no/api/v1/mal/innvilgelse_ftrl/forhaandsvis-pdf/kap2_2_foerste_ledd_a_helsedel_syke_foreldrepenger";
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

  function mapVedtakRader() {
    return [
      [
        { verdi: <Nav.Typo.Normaltekst className="lenke">Vedtak om frivillig medlemskap</Nav.Typo.Normaltekst> },
        { verdi: "Deloitte" },
        {
          verdi: (
            <a target="_blank" rel="noopener noreferrer" href={midlertidigStatiskPdfLinke}>
              <Ikoner.Forhandsvis />
            </a>
          ),
          style: "midtstilt",
        },
        { verdi: <></> },
      ],
      [
        {
          verdi: (
            <Nav.Typo.Normaltekst className="lenke">
              Kopi av vedtak om frivillig medlemskap til Skatteetaten
            </Nav.Typo.Normaltekst>
          ),
        },
        { verdi: "Skatteetaten" },
        {
          verdi: (
            <a target="_blank" rel="noopener noreferrer" href={midlertidigStatiskPdfLinke}>
              <Ikoner.Forhandsvis />
            </a>
          ),
          style: "midtstilt",
        },
        { verdi: <Ikoner.Bin />, style: "midtstilt" },
      ],
      [
        {
          verdi: (
            <Nav.Typo.Normaltekst className="lenke">
              Kopi av vedtak om frivillig medlemskap til bruker
            </Nav.Typo.Normaltekst>
          ),
        },
        { verdi: "Dag Fossum" },
        {
          verdi: (
            <a target="_blank" rel="noopener noreferrer" href={midlertidigStatiskPdfLinke}>
              <Ikoner.Forhandsvis />
            </a>
          ),
          style: "midtstilt",
        },
        { verdi: <Ikoner.Bin />, style: "midtstilt" },
      ],
      [
        {
          verdi: (
            <Nav.Typo.Normaltekst className="lenke">
              Kopi av vedtak om frivillig medlemskap til bruker
            </Nav.Typo.Normaltekst>
          ),
        },
        { verdi: "Dag Fossum" },
        {
          verdi: (
            <a target="_blank" rel="noopener noreferrer" href={midlertidigStatiskPdfLinke}>
              <Ikoner.Forhandsvis />
            </a>
          ),
          style: "midtstilt",
        },
        { verdi: <Ikoner.Bin />, style: "midtstilt" },
      ],
    ];
  }

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
            {alleLandkoder
              ? Utils.streng.storeForbokstaver(KV.finnTermFraListe(alleLandkoder, soknadsland[0]))
              : "Finner ikke arbeidsland"}
          </Nav.Typo.Normaltekst>
        </Nav.Column>
        <Nav.Column xs="4">
          <Nav.Typo.Element className="info">Arbeid utføres i avtaleland</Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="info">Ja</Nav.Typo.Normaltekst>
        </Nav.Column>
        <Nav.Column xs="3">
          <Nav.Typo.Element className="info">Familiemedlemmer</Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="info">Nei</Nav.Typo.Normaltekst>
        </Nav.Column>
      </Nav.Row>

      {trygdeavgiftFormValues &&
        trygdeavgiftFormValues.avgiftsgrunnlag &&
        [MKV.Koder.loenn_forhold.LØNN_FRA_NORGE, MKV.Koder.loenn_forhold.DELT_LØNN].includes(
          trygdeavgiftFormValues.avgiftsgrunnlag.lønnsforhold
        ) && (
          <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <Ikoner.Inntekt className="trygdeavgift_ikon" />
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
      {trygdeavgiftFormValues &&
        trygdeavgiftFormValues.avgiftsgrunnlag &&
        [MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET, MKV.Koder.loenn_forhold.DELT_LØNN].includes(
          trygdeavgiftFormValues.avgiftsgrunnlag.lønnsforhold
        ) && (
          <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <Ikoner.Inntekt className="trygdeavgift_ikon" />
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
        Fritekst til innleding <Nav.Hjelpetekst className="hjelpetekst" type={Nav.PopoverOrientering.Hoyre} />
      </Nav.Typo.Element>
      <Skjema.HTMLEditor
        feltNavn="fritekstInnledning"
        className="fritekst_editor"
        placeholder="Skriv inn tilleggsinformasjon til innledning..."
      />

      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        Fritekst til begrunnelse <Nav.Hjelpetekst className="hjelpetekst" type={Nav.PopoverOrientering.Hoyre} />
      </Nav.Typo.Element>
      <Skjema.HTMLEditor
        feltNavn="fritekstBegrunnelse"
        className="fritekst_editor"
        placeholder="Skriv inn tilleggsinformasjon til begrunnelse..."
      />

      <MottakerTabell
        rader={mapVedtakRader()}
        kolonner={[
          { verdi: "Dokumenter", bredde: "60%" },
          { verdi: "Mottaker", bredde: "20%" },
          { verdi: "Forhåndsvis", bredde: "10%", style: "normal_font_weight midtstilt" },
          { verdi: "Slett", bredde: "10%", style: "normal_font_weight midtstilt" },
        ]}
      />

      <div className="fane__knapplinje">
        <Nav.Knapp mini disabled={!redigerbart} className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp mini disabled={!redigerbart} className="fane__navigasjonsknapp" onClick={tilForsiden}>
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
