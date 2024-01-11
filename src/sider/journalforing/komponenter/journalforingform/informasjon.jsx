import { Component, Fragment } from "react";
import { connect } from "react-redux";
import { arrayRemove, change } from "redux-form";
import PT from "prop-types";

import MKV from "../../../../melosyskodeverk";
import * as Utils from "../../../../utils";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Nav from "../../../../navFrontend";
import * as MPT from "../../../../proptypes";
import * as Ikoner from "../../../../resources/images";
import * as KV from "../../../../kodeverk";

import { AvsenderVelgerForBruker, AvsenderVelgerForVirksomhet } from "../avsender";
import LenkeListeVelger from "../lenkelistevelger";
import JournalforingGjelder from "../journalforingGjelder";
import Komponent from "../komponent";
import { hentSammensattNavn } from "../../../../graphql/navn";

import { sokOperations } from "../../../../ducks/sok";
import { OrganisasjonOperations } from "../../../../ducks/organisasjoner";
import { formSelectors } from "../../../../ducks/form";

import "./informasjon.css";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const dokumenttitler = [
  { term: "Arbeidsforhold" },
  { term: "Bekreftelse på medlemskap i folketrygden" },
  { term: "Inntektsopplysninger" },
  { term: "Merknad til sak" },
  { term: "Studiedokumentasjon" },
  { term: "Søknad om medlemskap" },
  { term: "Unntak" },
  { term: "Søknad om A1 - Avklaring av trygdetilhørighet ved yrkesaktivitet innen EØS/Sveits" },
  { term: "Skjema for arbeidsgiver som sender arbeidstaker eller frilanser på midlertidig oppdrag i EØS/Sveits" },
];

/** Denne komponenten inneholder skjemafelter nødvendig for journalføringen
 * slik som informasjon om bruker, informasjon om dokument etc.
 */
class Informasjon extends Component {
  state = {
    hoveddokumentTittel: "",
    vedleggPdfTittler: [],
    logiskeVedleggTittler: [],
  };

  async componentDidMount() {
    const { vedlegg, journalforingSkjemaVerdier } = this.props;
    await this.oppdaterState("hoveddokumentTittel", journalforingSkjemaVerdier.hoveddokument.tittel);
    await this.oppdaterState(
      "vedleggPdfTittler",
      vedlegg.reduce((acc, elem) => {
        acc.push(elem.tittel);
        return acc;
      }, [])
    );
    await this.oppdaterState(
      "logiskeVedleggTittler",
      journalforingSkjemaVerdier.hoveddokument.logiskeVedlegg.map((tittel) => ({ tittel, ny: false }))
    );
    await this.oppdaterFelter(this.props, true);
  }

  async componentDidUpdate(prevProps) {
    await this.oppdaterFelter(prevProps);
  }

  oppdaterState = (stateNavn, verdi) => {
    this.setState({ [stateNavn]: verdi });
  };

  sokOrgnrFnrDnr = async (value) => {
    if (Utils.organisasjon.erOrgnrGyldig(value)) {
      const response = await this.props.sokOrgnr(value);
      return response?.data?.navn;
    }
    if (Utils.person.erGyldigFnrEllerDnr(value?.replace(" ", ""))) {
      return hentSammensattNavn(value.replace(" ", ""));
    }
    return null;
  };

  hentOgVisBruker = async (brukerID) => {
    const { kopierBrukerTilAvsender, tomAvsender } = this;
    const { settFeltInnhold, hentFagsakListe, journalforingSkjemaVerdier } = this.props;
    const journalfoeringGjelderBruker = journalforingSkjemaVerdier.journalforingGjelder === BRUKER;

    settFeltInnhold("brukerNavn", null);
    if (journalfoeringGjelderBruker) {
      tomAvsender();
    }

    if (!Utils.person.erGyldigFnr(brukerID) && !Utils.person.erGyldigDnr(brukerID)) {
      return;
    }

    const sammensattNavn = await hentSammensattNavn(brukerID);
    if (Utils._isEmpty(sammensattNavn)) {
      return;
    }
    settFeltInnhold("brukerNavn", sammensattNavn);
    if (journalfoeringGjelderBruker) {
      kopierBrukerTilAvsender(brukerID, sammensattNavn);
    }

    await hentFagsakListe(brukerID);
  };

  hentOgVisVirksomhet = async (virksomhetOrgnr) => {
    const { kopierVirksomhetTilAvsender, tomAvsender } = this;
    const { sokOrgnr, settFeltInnhold, hentFagsakListe, journalforingSkjemaVerdier } = this.props;
    const journalfoeringGjelderVirksomhet = journalforingSkjemaVerdier.journalforingGjelder === VIRKSOMHET;

    settFeltInnhold("virksomhetNavn", null);
    if (journalfoeringGjelderVirksomhet) {
      tomAvsender();
    }

    if (!Utils.organisasjon.erOrgnrGyldig(virksomhetOrgnr)) {
      return;
    }

    const response = await sokOrgnr(virksomhetOrgnr);
    const navn = response?.data?.navn;
    if (Utils._isEmpty(navn)) {
      return;
    }
    settFeltInnhold("virksomhetNavn", navn);
    kopierVirksomhetTilAvsender(virksomhetOrgnr, navn);
    await hentFagsakListe(virksomhetOrgnr);
  };

  hentOgVisAvsender = async (value) => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold("avsenderNavn", null);

    if (!value) {
      return;
    }

    if (Utils.organisasjon.erOrgnrGyldig(value) || Utils.person.erGyldigFnrEllerDnr(value?.replace(" ", ""))) {
      const navn = await this.sokOrgnrFnrDnr(value);
      if (Utils._isEmpty(navn)) {
        return;
      }
      settFeltInnhold("avsenderNavn", navn);
    }
  };

  oppdaterFelter = async (props, tvingOppdatering) => {
    const {
      brukerID: gammelBrukerID,
      avsenderID: gammelAvsenderID,
      virksomhetOrgnr: gammelVirksomhetOrgnr,
    } = props.journalforingSkjemaVerdier;
    const { brukerID, avsenderID, virksomhetOrgnr } = this.props.journalforingSkjemaVerdier;
    const { hentOgVisBruker, hentOgVisVirksomhet, hentOgVisAvsender } = this;

    if (gammelBrukerID !== brukerID || tvingOppdatering) {
      await hentOgVisBruker(brukerID);
    }

    if (gammelVirksomhetOrgnr !== virksomhetOrgnr || tvingOppdatering) {
      await hentOgVisVirksomhet(virksomhetOrgnr);
    }

    if (gammelAvsenderID !== avsenderID || tvingOppdatering) {
      await hentOgVisAvsender(avsenderID);
    }
  };

  kopierBrukerTilAvsender = (
    brukerID = this.props.journalforingSkjemaVerdier.brukerID,
    brukerNavn = this.props.journalforingSkjemaVerdier.brukerNavn
  ) => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold("avsenderID", brukerID);
    settFeltInnhold("avsenderNavn", brukerNavn);
  };

  kopierVirksomhetTilAvsender = (
    virksomhetOrgnr = this.props.journalforingSkjemaVerdier.virksomhetOrgnr,
    virksomhetNavn = this.props.journalforingSkjemaVerdier.virksomhetNavn
  ) => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold("avsenderType", MKV.Koder.avsendertyper.ORGANISASJON);
    settFeltInnhold("avsenderID", virksomhetOrgnr);
    settFeltInnhold("avsenderNavn", virksomhetNavn);
  };

  tomAvsender = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold("avsenderID", null);
    settFeltInnhold("avsenderNavn", null);
  };

  updateVedleggTittel = async (index, verdi) => {
    const tittler = [...this.state.vedleggPdfTittler];
    tittler[index] = verdi;
    await this.oppdaterState("vedleggPdfTittler", tittler);
  };

  updateLogiskeVedleggTittel = async (index, verdi) => {
    const tittler = [...this.state.logiskeVedleggTittler];
    tittler[index] = { ...tittler[index], tittel: verdi };
    await this.oppdaterState("logiskeVedleggTittler", tittler);
  };

  deleteLogiskeVedleggTittel = async (index) => {
    const tittler = [...this.state.logiskeVedleggTittler];
    tittler.splice(index, 1);
    await this.props.fjernFeltInnhold("hoveddokument.logiskeVedlegg", index);
    await this.oppdaterState("logiskeVedleggTittler", tittler);
  };

  addLogiskeVedleggTittler = async (verdi) => {
    const tittler = [...this.state.logiskeVedleggTittler];
    tittler.push({ tittel: verdi, ny: true });
    await this.oppdaterState("logiskeVedleggTittler", tittler);
  };

  render() {
    const { vedlegg, settFeltInnhold, journalforingSkjemaVerdier } = this.props;
    const {
      hoveddokument: { tittel: hoveddokumentTittel, logiskeVedlegg = [] },
      vedlegg: skjemaVedlegg,
      brukerNavn,
      virksomhetNavn,
      journalforingGjelder,
    } = journalforingSkjemaVerdier;

    const InformasjonOmBrukerEllerVirksomhet =
      journalforingGjelder === VIRKSOMHET ? (
        <Komponent
          ikon={Ikoner.Building}
          tittel="Informasjon om virksomhet"
          innhold={
            <>
              <Skjema.FellesInputFnrDnrOrgnrSaksnr feltNavn="virksomhetOrgnr" label="Org.nr." bredde="L" />
              {!Utils._isEmpty(virksomhetNavn) && (
                <span className="bruker-eller-org-navn">
                  <Nav.Typo.Element className="term">Navn:</Nav.Typo.Element>
                  <Nav.Typo.Normaltekst>{virksomhetNavn}</Nav.Typo.Normaltekst>
                </span>
              )}
            </>
          }
        />
      ) : (
        <Komponent
          ikon={Ikoner.AccountCircle}
          tittel="Informasjon om bruker"
          innhold={
            <>
              <Skjema.FellesInputFnrDnrOrgnrSaksnr feltNavn="brukerID" label="Brukers f.nr/d-nr." bredde="L" />
              {!Utils._isEmpty(brukerNavn) && (
                <span className="bruker-eller-org-navn">
                  <Nav.Typo.Element className="term">Navn:</Nav.Typo.Element>
                  <Nav.Typo.Normaltekst>{brukerNavn}</Nav.Typo.Normaltekst>
                </span>
              )}
            </>
          }
        />
      );

    return (
      <div className="informasjon">
        <JournalforingGjelder />
        {InformasjonOmBrukerEllerVirksomhet}

        <Komponent
          ikon={Ikoner.Applicant}
          tittel="Informasjon om avsender"
          innhold={
            journalforingGjelder === VIRKSOMHET ? (
              <AvsenderVelgerForVirksomhet
                tomAvsender={this.tomAvsender}
                kopierVirksomhetTilAvsender={this.kopierVirksomhetTilAvsender}
              />
            ) : (
              <AvsenderVelgerForBruker
                kopierBrukerTilAvsender={this.kopierBrukerTilAvsender}
                tomAvsender={this.tomAvsender}
                settFeltInnhold={settFeltInnhold}
                hentOgVisAvsender={this.hentOgVisAvsender}
              />
            )
          }
        />

        <Komponent
          ikon={Ikoner.Files}
          tittel="Dokumenter"
          innhold={
            <>
              <Skjema.Datovelger
                label={<Nav.Typo.Element>Mottatt</Nav.Typo.Element>}
                feltNavn="mottattDato"
                bredde="S"
              />

              <div className="dokumentblokk">
                <Nav.Typo.Element>Hoveddokument</Nav.Typo.Element>
                <LenkeListeVelger
                  feltNavn="hoveddokument.tittel"
                  muligeValg={dokumenttitler}
                  dokumentTittel={hoveddokumentTittel}
                  undoTittel={this.state.hoveddokumentTittel}
                  updateTittel={() => this.oppdaterState("hoveddokumentTittel", hoveddokumentTittel)}
                />
              </div>

              <Nav.Typo.Element>Vedlegg</Nav.Typo.Element>
              {(vedlegg.length > 0 || logiskeVedlegg.length > 0) && (
                <div className="dokumentblokk">
                  {vedlegg.length > 0 &&
                    vedlegg.map((elem, index) => (
                      <Fragment key={elem.dokumentID}>
                        <LenkeListeVelger
                          feltNavn={`vedlegg.pdf.tittel_${index}`}
                          muligeValg={dokumenttitler}
                          dokumentTittel={skjemaVedlegg.pdf[`tittel_${index}`]}
                          undoTittel={this.state.vedleggPdfTittler[index]}
                          updateTittel={() => this.updateVedleggTittel(index, skjemaVedlegg.pdf[`tittel_${index}`])}
                        />
                      </Fragment>
                    ))}
                  {logiskeVedlegg.length > 0 &&
                    logiskeVedlegg.map((dokumentTittel, index) => (
                      /* eslint-disable-next-line react/no-array-index-key */
                      <Fragment key={`logiskeVedlegg[${index}]`}>
                        <LenkeListeVelger
                          feltNavn={`hoveddokument.logiskeVedlegg[${index}]`}
                          muligeValg={dokumenttitler}
                          dokumentTittel={dokumentTittel}
                          undoTittel={this.state.logiskeVedleggTittler[index]?.tittel}
                          updateTittel={() => this.updateLogiskeVedleggTittel(index, dokumentTittel)}
                          slettTittel={() => this.deleteLogiskeVedleggTittel(index)}
                          visSlett={this.state.logiskeVedleggTittler[index]?.ny}
                        />
                      </Fragment>
                    ))}
                </div>
              )}

              <Skjema.ListeVelger
                feltNavn="hoveddokument.logiskeVedlegg"
                gruppe
                tillatFritekst
                muligeValg={dokumenttitler}
                placeholder="Velg eller skriv inn egen tittel"
                visValgtListe={false}
                handleLagre={(value) => this.addLogiskeVedleggTittler(value)}
                className="logiskeVedlegg-listevelger"
              />
            </>
          }
        />
      </div>
    );
  }
}

Informasjon.propTypes = {
  journalforingSkjemaVerdier: MPT.JournalforingSkjemaVerdier,
  journalpostID: PT.string,
  dokumentID: PT.string,
  vedlegg: PT.arrayOf(PT.shape({ dokumentID: PT.string, tittel: PT.string })),
  settFeltInnhold: PT.func.isRequired,
  fjernFeltInnhold: PT.func.isRequired,
  hentFagsakListe: PT.func.isRequired,
  sokOrgnr: PT.func.isRequired,
};

Informasjon.defaultProps = {
  journalforingSkjemaVerdier: {},
  journalpostID: "",
  dokumentID: "",
  vedlegg: [],
};

const mapStateToProps = (state) => ({
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
});

const mapDispatchToProps = (dispatch) => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change(KV.Form.JOURNALFORING, feltNavn, verdi)),
  fjernFeltInnhold: (feltNavn, index) => dispatch(arrayRemove(KV.Form.JOURNALFORING, feltNavn, index)),
  hentFagsakListe: (fnrEllerOrgnr) => dispatch(sokOperations.sok(fnrEllerOrgnr)),
  sokOrgnr: (orgnr) => dispatch(OrganisasjonOperations.hent(orgnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Informasjon);
