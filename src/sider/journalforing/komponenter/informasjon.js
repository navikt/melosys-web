import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { change } from "redux-form";
import PT from "prop-types";

import * as Utils from "../../../utils";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as Konstanter from "../../../constants";
import * as Api from "../../../services/api";
import * as Ikoner from "../../../resources/images";
import * as Mui from "../../../felleskomponenter/ui";
import * as KV from "../../../kodeverk";

import AvsenderVelger from "./avsendervelger";
import LenkeListeVelger from "./lenkelistevelger";
import DokumentetJournalføresPå from "./dokumentetJournalføresPå";
import { FeatureToggle } from "../../../featuretoggle";

import { PersonSelectors } from "../../../ducks/personer";
import { OrganisasjonSelectors } from "../../../ducks/organisasjoner";
import { formSelectors } from "../../../ducks/form";

import "./informasjon.css";

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
    spinner: {},
    hoveddokumentTittel: "",
    vedleggPdfTittler: [],
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
    await this.oppdaterFelter(this.props, true);
  }

  async componentDidUpdate(prevProps) {
    await this.oppdaterFelter(prevProps);
  }

  oppdaterState = (stateNavn, verdi) => {
    this.setState({ [stateNavn]: verdi });
  };

  oppdaterFelter = async (props, tvingOppdatering) => {
    const {
      brukerID: gammelBrukerID,
      avsenderID: gammelAvsenderID,
      virksomhetOrgnr: gammelVirksomhetOrgnr,
    } = props.journalforingSkjemaVerdier;
    const { brukerID = "", avsenderID = "", virksomhetOrgnr = "" } = this.props.journalforingSkjemaVerdier;
    const { hentOgVisBruker, hentOgVisVirksomhet, hentOgVisAvsender } = this.props;

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

  erGyldigAvsenderID = (verdi) =>
    verdi.length === Konstanter.ANTALL_TALL_I_ORGNR ||
    verdi.length === Konstanter.ANTALL_TALL_I_DNR ||
    verdi.length === Konstanter.ANTALL_TALL_I_FNR;

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
    settFeltInnhold("avsenderID", virksomhetOrgnr);
    settFeltInnhold("avsenderNavn", virksomhetNavn);
  };

  tomAvsender = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold("avsenderID", "");
    settFeltInnhold("avsenderNavn", "");
  };

  sjekkBruker = async (verdi) => {
    const { tomAvsender, kopierBrukerTilAvsender } = this;
    const { settFeltInnhold, hentOgVisBruker } = this.props;
    const { erBrukerAvsender } = this.props.journalforingSkjemaVerdier;

    if (Utils.person.erGyldigFnr(verdi)) {
      await this.spinner("brukerNavn");
      const response = await hentOgVisBruker(verdi);
      if (!response) return;
      const { brukerID, sammensattNavn } = response;
      if (erBrukerAvsender) {
        kopierBrukerTilAvsender(brukerID, sammensattNavn);
      }
    } else {
      settFeltInnhold("brukerNavn", "");
      if (erBrukerAvsender) {
        tomAvsender();
      }
    }
  };

  sjekkVirksomhet = async (verdi) => {
    const { settFeltInnhold, hentOgVisVirksomhet } = this.props;

    if (Utils.organisasjon.erOrgnrGyldig(verdi)) {
      await this.spinner("virksomhetNavn");
      await hentOgVisVirksomhet(verdi);
    } else {
      settFeltInnhold("virksomhetNavn", "");
    }
  };
  sjekkAvsender = async (verdi) => {
    const { erGyldigAvsenderID } = this;
    const { settFeltInnhold, hentOgVisAvsender } = this.props;

    if (erGyldigAvsenderID(verdi)) {
      await this.spinner("avsenderNavn");
      await hentOgVisAvsender(verdi);
    } else {
      await settFeltInnhold("avsenderNavn", "");
    }
  };

  IDFeltTastOppHandler = async (event) => {
    const { navn: feltNavn, value } = event.target;

    if (feltNavn === "brukerID") {
      await this.sjekkBruker(value);
    }
    if (feltNavn === "virksomhetOrgnr") {
      await this.sjekkVirksomhet(value);
    }
    if (feltNavn === "avsenderID") {
      await this.sjekkAvsender(value);
    }
  };

  toggleSpinn = (navn, spin) => ({ spinner: { ...this.state.spinner, [navn]: spin } });
  /** Toggle spinneren av og på. Når spinner skjules, sett en timeout på 500ms.
   * Dette sikrer at spinneren ikke bare flasher dersom kallet til API går raskt. Dataene vises.
   * umiddelbart fra payload, men spinneren har en levetid på minimum 500 ms som gir brukeren
   * tid til å tolke grensesnittet, dvs spinneren.
   * @param navn {String} Navnet på spinneren
   * @param ms {Number} antall millisekunder
   */
  spinner = async (navn, ms = 1000) => {
    this.setState(this.toggleSpinn(navn, true));
    await Utils.delay(ms);
    this.setState(this.toggleSpinn(navn, false));
  };
  updateVedleggTittel = async (index, verdi) => {
    const tittler = [...this.state.vedleggPdfTittler];
    tittler[index] = verdi;
    await this.oppdaterState("vedleggPdfTittler", tittler);
  };

  render() {
    const { journalpostID, dokumentID, vedlegg, settFeltInnhold, hentOgVisRepresentant, journalforingSkjemaVerdier } =
      this.props;
    const {
      hoveddokument: { tittel: hoveddokumentTittel },
      vedlegg: skjemaVedlegg,
      brukerNavn,
      virksomhetNavn,
      journalføresPå,
    } = journalforingSkjemaVerdier;
    const {
      spinner: { brukerNavn: visBrukerSpinner },
      spinner: { virksomhetNavn: visVirksomhetSpinner },
      spinner: { avsenderNavn: visAvsenderSpinner },
    } = this.state;

    const dokumentURI = (jpostID, dokID) => Api.Dokumenter.pdf.uriPath(jpostID, dokID);

    const InformasjonOmBrukerEllerVirksomhet =
      journalføresPå === KV.Koder.JournalføringRolle.VIRKSOMHET ? (
        <>
          <Mui.Undertittel tekst="Informasjon om virksomhet" ikon={Ikoner.AccountCircle} className="undertittel" />
          <Skjema.Input feltNavn="virksomhetOrgnr" label="Organisasjonsnummer:" onKeyUp={this.IDFeltTastOppHandler} />
          {!Utils._isEmpty(virksomhetNavn) && (
            <span>
              <Nav.Typo.Element style={{ display: "inline-block", marginRight: "0.5rem" }}>Navn:</Nav.Typo.Element>
              <Nav.Typo.Normaltekst style={{ display: "inline-block" }}>{virksomhetNavn}</Nav.Typo.Normaltekst>
            </span>
          )}
          {visVirksomhetSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" />}
        </>
      ) : (
        <>
          <Mui.Undertittel tekst="Informasjon om bruker" ikon={Ikoner.AccountCircle} className="undertittel" />
          <Skjema.Input feltNavn="brukerID" label="Brukers fnr eller dnr:" onKeyUp={this.IDFeltTastOppHandler} />
          {!Utils._isEmpty(brukerNavn) && (
            <span>
              <Nav.Typo.Element style={{ display: "inline-block", marginRight: "0.5rem" }}>Navn:</Nav.Typo.Element>
              <Nav.Typo.Normaltekst style={{ display: "inline-block" }}>{brukerNavn}</Nav.Typo.Normaltekst>
            </span>
          )}
          {visBrukerSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" />}
        </>
      );

    return (
      <div className="informasjon">
        <FeatureToggle togglename="melosys.behandle_alle_saker">
          {(toggle) =>
            toggle === "enabled" ? (
              <>
                <DokumentetJournalføresPå />
                {InformasjonOmBrukerEllerVirksomhet}
              </>
            ) : (
              <>
                <Mui.Undertittel tekst="Informasjon om bruker" ikon={Ikoner.AccountCircle} className="undertittel" />
                <Skjema.Input feltNavn="brukerID" label="Brukers fnr eller dnr:" onKeyUp={this.IDFeltTastOppHandler} />
                <Skjema.Input feltNavn="brukerNavn" label="Brukers navn:" disabled className="brukers-navn" />
                {visBrukerSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" />}
              </>
            )
          }
        </FeatureToggle>

        <Mui.Undertittel tekst="Informasjon om avsender" ikon={Ikoner.Globe} className="undertittel" />
        <AvsenderVelger
          className="avsenderVelger"
          kopierBrukerTilAvsender={this.kopierBrukerTilAvsender}
          kopierVirksomhetTilAvsender={this.kopierVirksomhetTilAvsender}
          tomAvsender={this.tomAvsender}
          settFeltInnhold={settFeltInnhold}
          visAvsenderSpinner={visAvsenderSpinner}
          hentOgVisRepresentant={hentOgVisRepresentant}
        />

        <Mui.Undertittel tekst="Dokumenter" ikon={Ikoner.Filenew} className="undertittel oversteUndertittel" />
        <Skjema.Datovelger label="Mottatt dato" feltNavn="mottattDato" bredde="S" />
        <Nav.Fieldset legend="Hoveddokument:">
          <LenkeListeVelger
            feltNavn="hoveddokument.tittel"
            placeholder="(velg eller skriv inn egen tittel)"
            muligeValg={dokumenttitler}
            linkTo={dokumentURI(journalpostID, dokumentID)}
            dokumentTittel={hoveddokumentTittel}
            undoTittel={this.state.hoveddokumentTittel}
            updateTittel={() => this.oppdaterState("hoveddokumentTittel", hoveddokumentTittel)}
          />
        </Nav.Fieldset>
        <p>Vedlegg</p>
        {vedlegg.length > 0 &&
          vedlegg.map((elem, index) => (
            <Fragment key={elem.dokumentID}>
              <LenkeListeVelger
                feltNavn={`vedlegg.pdf.tittel_${index}`}
                placeholder="(velg eller skriv inn egen tittel)"
                muligeValg={dokumenttitler}
                linkTo={dokumentURI(journalpostID, elem.dokumentID)}
                dokumentTittel={skjemaVedlegg.pdf[`tittel_${index}`]}
                undoTittel={this.state.vedleggPdfTittler[index]}
                updateTittel={() => this.updateVedleggTittel(index, skjemaVedlegg.pdf[`tittel_${index}`])}
              />
            </Fragment>
          ))}
        <Skjema.ListeVelger
          feltNavn="hoveddokument.logiskeVedlegg"
          label="Velg ny tittel:"
          gruppe
          tillatFritekst
          muligeValg={dokumenttitler}
          placeholder="(Velg eller skriv inn egen tittel)"
        />
      </div>
    );
  }
}

Informasjon.propTypes = {
  journalforingSkjemaVerdier: MPT.JournalforingSkjemaVerdier,
  hentOgVisBruker: PT.func.isRequired,
  hentOgVisVirksomhet: PT.func.isRequired,
  hentOgVisAvsender: PT.func.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
  journalpostID: PT.string,
  dokumentID: PT.string,
  vedlegg: PT.arrayOf(PT.shape({ dokumentID: PT.string, tittel: PT.string })),
  settFeltInnhold: PT.func.isRequired,
};

Informasjon.defaultProps = {
  journalforingSkjemaVerdier: {},
  journalpostID: "",
  dokumentID: "",
  vedlegg: [],
};

const mapStateToProps = (state) => ({
  person: PersonSelectors.personerSelector(state),
  organisasjon: OrganisasjonSelectors.organisasjonerSelector(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
});

const mapDispatchToProps = (dispatch) => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change("journalforing", feltNavn, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Informasjon);
