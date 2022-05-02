import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { change } from "redux-form";
import PT from "prop-types";

import MKV from "../../../melosyskodeverk";
import * as Utils from "../../../utils";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as Konstanter from "../../../constants";
import * as Api from "../../../services/api";
import * as Ikoner from "../../../resources/images";
import * as Mui from "../../../felleskomponenter/ui";
import { VIRKSOMHET } from "./journalforingform";

import AvsenderVelger from "./avsendervelger";
import LenkeListeVelger from "./lenkelistevelger";
import JournalforingGjelder from "./journalforingGjelder";
import { FeatureToggle } from "../../../featuretoggle";
import { hentSammensattNavn } from "../../../graphql/navn";

import { PersonSelectors } from "../../../ducks/personer";
import { sokOperations } from "../../../ducks/sok";
import { OrganisasjonOperations, OrganisasjonSelectors } from "../../../ducks/organisasjoner";
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

  hentOgVisBruker = async (brukerID) => {
    const { kopierBrukerTilAvsender, tomAvsender } = this;
    const { settFeltInnhold, hentFagsakListe, journalforingSkjemaVerdier } = this.props;
    const brukerErAvsender = journalforingSkjemaVerdier.avsenderType === MKV.Koder.avsendertyper.PERSON;

    settFeltInnhold("brukerNavn", null);
    if (brukerErAvsender) {
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
    await hentFagsakListe(brukerID);
    if (brukerErAvsender) {
      kopierBrukerTilAvsender(brukerID, sammensattNavn);
    }
  };

  hentOgVisVirksomhet = async (virksomhetOrgnr) => {
    const { kopierVirksomhetTilAvsender, tomAvsender } = this;
    const { sokOrgnr, settFeltInnhold, hentFagsakListe, journalforingSkjemaVerdier } = this.props;
    const virksomhetErAvsender = journalforingSkjemaVerdier.avsenderType === MKV.Koder.avsendertyper.PERSON;

    settFeltInnhold("virksomhetNavn", null);
    if (virksomhetErAvsender) {
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
    await hentFagsakListe(virksomhetOrgnr);
    if (virksomhetErAvsender) {
      kopierVirksomhetTilAvsender(virksomhetOrgnr, navn);
    }
  };

  hentOgVisAvsender = async (value) => {
    const { sokOrgnr, settFeltInnhold } = this.props;
    settFeltInnhold("avsenderNavn", null);

    if (!value) {
      return;
    }

    if (value.length === Konstanter.ANTALL_TALL_I_ORGNR) {
      const response = await sokOrgnr(value);
      const navn = response?.data?.navn;
      if (Utils._isEmpty(navn)) {
        return;
      }
      settFeltInnhold("avsenderNavn", navn);
    }

    if (Utils.person.erGyldigFnr(value) || Utils.person.erGyldigDnr(value)) {
      const sammensattNavn = await hentSammensattNavn(value);
      if (Utils._isEmpty(sammensattNavn)) {
        return;
      }
      settFeltInnhold("avsenderNavn", sammensattNavn);
    }
  };

  hentOgVisRepresentant = async (value) => {
    const { sokOrgnr, settFeltInnhold } = this.props;

    settFeltInnhold("representantNavn", null);

    if (!value) {
      return;
    }

    if (value.length === Konstanter.ANTALL_TALL_I_ORGNR) {
      const response = await sokOrgnr(value);
      const navn = response?.data?.navn;
      if (Utils._isEmpty(navn)) {
        return;
      }
      settFeltInnhold("representantNavn", navn);
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

  render() {
    const { journalpostID, dokumentID, vedlegg, settFeltInnhold, journalforingSkjemaVerdier } = this.props;
    const {
      hoveddokument: { tittel: hoveddokumentTittel },
      vedlegg: skjemaVedlegg,
      brukerNavn,
      virksomhetNavn,
      journalforingGjelder,
    } = journalforingSkjemaVerdier;
    const { hentOgVisRepresentant } = this;

    const dokumentURI = (jpostID, dokID) => Api.Dokumenter.pdf.uriPath(jpostID, dokID);

    const InformasjonOmBrukerEllerVirksomhet =
      journalforingGjelder === VIRKSOMHET ? (
        <>
          <Mui.Undertittel tekst="Informasjon om virksomhet" ikon={Ikoner.AccountCircle} className="undertittel" />
          <Skjema.Input feltNavn="virksomhetOrgnr" label="Organisasjonsnummer:" onKeyUp={this.IDFeltTastOppHandler} />
          {!Utils._isEmpty(virksomhetNavn) && (
            <span>
              <Nav.Typo.Element style={{ display: "inline-block", marginRight: "0.5rem" }}>Navn:</Nav.Typo.Element>
              <Nav.Typo.Normaltekst style={{ display: "inline-block" }}>{virksomhetNavn}</Nav.Typo.Normaltekst>
            </span>
          )}
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
        </>
      );

    return (
      <div className="informasjon">
        <FeatureToggle togglename="melosys.behandle_alle_saker">
          {(toggle) =>
            toggle === "enabled" ? (
              <>
                <JournalforingGjelder />
                {InformasjonOmBrukerEllerVirksomhet}
              </>
            ) : (
              <>
                <Mui.Undertittel tekst="Informasjon om bruker" ikon={Ikoner.AccountCircle} className="undertittel" />
                <Skjema.Input feltNavn="brukerID" label="Brukers fnr eller dnr:" onKeyUp={this.IDFeltTastOppHandler} />
                <Skjema.Input feltNavn="brukerNavn" label="Brukers navn:" disabled className="brukers-navn" />
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
  journalpostID: PT.string,
  dokumentID: PT.string,
  vedlegg: PT.arrayOf(PT.shape({ dokumentID: PT.string, tittel: PT.string })),
  settFeltInnhold: PT.func.isRequired,
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
  person: PersonSelectors.personerSelector(state),
  organisasjon: OrganisasjonSelectors.organisasjonerSelector(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
});

const mapDispatchToProps = (dispatch) => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change("journalforing", feltNavn, verdi)),
  hentFagsakListe: (fnrEllerOrgnr) => dispatch(sokOperations.sok(fnrEllerOrgnr)),
  sokOrgnr: (orgnr) => dispatch(OrganisasjonOperations.hent(orgnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Informasjon);
