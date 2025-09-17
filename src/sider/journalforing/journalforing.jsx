/* eslint no-alert:off, consistent-return:off */
import { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { autofill, change, getFormSyncErrors, getFormValues, isValid, SubmissionError, touch } from "redux-form";
import PT from "prop-types";

import MKV from "../../melosyskodeverk";

import * as KV from "../../kodeverk";
import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";
import * as Api from "../../services/api";
import * as MPT from "../../proptypes";
import { JOURNALFORING_HENSIKT } from "../../constants";

import Sticky from "../../felleskomponenter/sticky";
import PDFDokument from "./komponenter/pdfdokument";
import JournalforingSED from "./komponenter/journalforingsed";
import JournalforingForm from "./komponenter/journalforingform/journalforingform";
import FeilmeldingDialog from "./komponenter/feilmeldingDialog";

import { oppgaverOperations } from "../../ducks/oppgaver";
import { landkoderOperations } from "../../ducks/landkoder";
import { journalforingOperations, journalforingSelectors } from "../../ducks/journalforing";
import { formSelectors } from "../../ducks/form";

import "./journalforing.less";

class Journalforing extends Component {
  state = {
    valgtDokumentID: -1,
    visFeilmeldingDialog: false,
    feilmeldinger: [],
    submitSpinner: false,
  };

  async componentDidMount() {
    const { journalpostID } = this.props.match.params;
    await this.props.hentJournalOppgave(journalpostID);
    this.props.hentLandkoder();
  }

  componentWillUnmount() {
    this.props.resetJournalforingState();
  }

  onChangeVedlegg = (e) => {
    const { value: valgtDokumentID } = e.target;
    this.setState({ valgtDokumentID });
  };

  /** Selv om saksbehandler velger å avbryte journalføringsoppgaven vil den fortsatt ligge
   * i "Mine Oppgaver"-listen. Vi trenger derfor ikke å gi noen melding til backend om at
   * noe er avbrutt - kun redirecte til forsiden.
   */
  avbrytJournalforing = () => {
    this.props.tilForsiden();
  };

  mapFysiskeVedleggsTitlerTilVedlegg = (pdf) => {
    const { vedleggsdokumenter } = this.props;
    if (!vedleggsdokumenter || vedleggsdokumenter.length === 0) return [];
    const pdfTitler = Object.values(pdf);
    if (pdfTitler.length === 0) return [];
    return pdfTitler.map((tittel, index) => {
      const { dokumentID, logiskeVedlegg } = vedleggsdokumenter[index];
      return { dokumentID, tittel, logiskeVedlegg };
    });
  };

  mapAvsenderType = (avsenderType, avsenderID) => {
    if (avsenderType === KV.AvsenderTyper.FRITEKST) {
      return null;
    }
    if (avsenderType === KV.AvsenderTyper.ANNEN_PERSON_ELLER_VIRKSOMHET) {
      if (Utils.organisasjon.erOrgnrGyldig(avsenderID)) {
        return MKV.Koder.avsendertyper.ORGANISASJON;
      }
      if (Utils.person.erGyldigFnrEllerDnr(avsenderID)) {
        return MKV.Koder.avsendertyper.PERSON;
      }
    }

    return avsenderType;
  };

  /** Ikke all informasjon som vises i skjemaet skal sendes tilbake til backend. Et eksempel på det er dato som
   * settes inn i skjemaet kun til info - ikke til endring - slik som feks navn på bruker.
   * Derfor må vi bygge opp og evt vaske et nytt objekt som kan sendes til backend.
   *
   * @returns {object} Objektet som skal sendes videre som payload.
   */
  vaskDokumentInformasjon = (hensikt) => {
    /* eslint-disable-next-line no-console */
    console.assert(hensikt, { message: "hensikt må ha verdi" });

    const { oppgaveID, journalpostID } = this.props.match.params;
    const {
      journalforingSkjemaVerdier,
      journalforing: { hoveddokument = {}, mottaksKanalErEessi },
    } = this.props;
    const {
      brukerID,
      virksomhetOrgnr,
      avsenderID,
      avsenderNavn,
      hoveddokument: { tittel, logiskeVedlegg },
      vedlegg: vedleggSkjema,
      skalTilordnes,
      mottattDato,
      avsenderType,
      forvaltningsmeldingMottaker,
    } = journalforingSkjemaVerdier;

    const { dokumentID } = hoveddokument;
    const vedlegg = [...this.mapFysiskeVedleggsTitlerTilVedlegg(vedleggSkjema.pdf)];

    // Data som er felles
    let journalPostData = {
      brukerID,
      virksomhetOrgnr,
      hoveddokument: {
        dokumentID,
        tittel,
        logiskeVedlegg: logiskeVedlegg.filter((lv) => lv), // fjern tomme titler
      },
      journalpostID,
      oppgaveID,
      vedlegg,
      skalTilordnes,
      mottattDato: Utils.dato.formatterDatoTilISO(mottattDato),
      forvaltningsmeldingMottaker,
    };

    if (!mottaksKanalErEessi) {
      journalPostData = {
        ...journalPostData,
        avsenderID,
        avsenderNavn,
        avsenderType: this.mapAvsenderType(avsenderType, avsenderID),
      };
    }

    if (hensikt === JOURNALFORING_HENSIKT.KNYTT) {
      return this.dataSpesifiktTilKnytt(journalPostData);
    }
    if (hensikt === JOURNALFORING_HENSIKT.ANDREGANGSBEHANDLE) {
      return this.dataSpesifiktTilAndregangs(journalPostData);
    }
    if (hensikt === JOURNALFORING_HENSIKT.OPPRETT) {
      return this.dataSpesifiktTilOpprett(journalPostData);
    }
  };

  dataSpesifiktTilKnytt = (fellesData) => {
    const { saksnummer, vurderDokument } = this.props.journalforingSkjemaVerdier;
    return {
      ...fellesData,
      saksnummer,
      ingenVurdering: !vurderDokument,
    };
  };

  dataSpesifiktTilAndregangs = (fellesData) => {
    const { behandlingstema, behandlingstype, saksnummer } = this.props.journalforingSkjemaVerdier;

    return {
      ...fellesData,
      behandlingstemaKode: behandlingstema,
      behandlingstypeKode: behandlingstype,
      saksnummer,
    };
  };

  dataSpesifiktTilOpprett = (fellesData) => {
    const {
      sakstype,
      sakstema,
      opprettnysak_behandlingstema,
      opprettnysak_behandlingstype,
      journalforingSoknadsland,
      journalforingSoknadslandFlereLandUkjentHvilke,
      journalforingPeriodeFraOgMed,
      journalforingPeriodeTilOgMed,
    } = this.props.journalforingSkjemaVerdier;

    const fagsak = {
      sakstype,
      sakstema,
      soknadsperiode: {
        fom: Utils.dato.formatterDatoTilISO(journalforingPeriodeFraOgMed, null),
        tom: Utils.dato.formatterDatoTilISO(journalforingPeriodeTilOgMed, null),
      },
      land: {
        landkoder: journalforingSoknadsland || [],
        flereLandUkjentHvilke: journalforingSoknadslandFlereLandUkjentHvilke,
      },
    };

    return {
      ...fellesData,
      behandlingstemaKode: opprettnysak_behandlingstema,
      behandlingstypeKode: opprettnysak_behandlingstype,
      fagsak,
    };
  };

  resetFeilmeldinger = () => {
    this.setState({
      feilmeldinger: [],
    });
  };

  skjulFeilmeldingDialogOgResetFeilmeldinger = () => {
    this.setState({ visFeilmeldingDialog: false });
    this.resetFeilmeldinger();
  };

  sjekkErrorOgVisFeilmelding = (error) => {
    if (error.status >= 500) {
      this.setState({
        feilmeldinger: [
          {
            tittel: "Teknisk feil",
            innhold:
              "Det oppsto en teknisk feil. Ta kontakt med brukerstøtte dersom problemet oppstår gjentatte ganger.",
          },
        ],
      });
    } else if (error.status >= 400) {
      this.setState({
        feilmeldinger: [
          {
            tittel: "Feil",
            innhold: error.body.message,
          },
        ],
      });
    }

    this.setState({ visFeilmeldingDialog: true });
  };

  /** Når saksbehandler klikker "knytt til eksisterende sak" skal det åpnes for validering av
   * relevante felter før saken tilordnes (sendes til API) og saksbehandler returneres til forsiden.
   * @returns {boolean}
   */
  knyttTilEksisterendeSak = async () => {
    const {
      journalforingSkjemaVerdier: { behandlingstype },
      settJournalforingHensikt,
      tilForsiden,
    } = this.props;

    const hensikt = behandlingstype ? JOURNALFORING_HENSIKT.ANDREGANGSBEHANDLE : JOURNALFORING_HENSIKT.KNYTT;
    await settJournalforingHensikt(hensikt);

    this.touchAll(KV.Form.JOURNALFORING, this.props.errors);

    // Tøm den delen av skjema som ikke skal brukes.
    this.resetSkjemaFelterForOpprettFagsak();

    if (!Utils._isEmpty(this.props.errors)) {
      throw new SubmissionError(this.props.errors);
    }

    const journalforingData = this.vaskDokumentInformasjon(hensikt);

    try {
      if (hensikt === JOURNALFORING_HENSIKT.ANDREGANGSBEHANDLE) {
        await Api.Journalforing.nyVurdering(journalforingData);
      }
      if (hensikt === JOURNALFORING_HENSIKT.KNYTT) {
        await Api.Journalforing.knytt(journalforingData);
      }
      this.setState({ visFeilmeldingDialog: false });
      return tilForsiden();
    } catch (error) {
      this.sjekkErrorOgVisFeilmelding(error);
    }
  };

  /** Når saksbehandler klikker "opprett sak" skal det åpnes for validering av
   * relevante felter før ny sak opprettes (sendes til API) og saksbehandler returneres til forsiden.
   * @returns {boolean}
   */
  opprettFagsak = async () => {
    const { settJournalforingHensikt, tilForsiden } = this.props;

    await settJournalforingHensikt(JOURNALFORING_HENSIKT.OPPRETT);

    this.touchAll(KV.Form.JOURNALFORING, this.props.errors);

    // Tøm den delen av skjema som ikke skal brukes.
    this.resetSkjemaFelterForEksisterendeSaker();

    if (!Utils._isEmpty(this.props.errors)) {
      throw new SubmissionError(this.props.errors);
    }

    const journalforingData = this.vaskDokumentInformasjon(JOURNALFORING_HENSIKT.OPPRETT);

    try {
      await Api.Journalforing.opprett(journalforingData);
      this.setState({ visFeilmeldingDialog: false });
      return tilForsiden();
    } catch (error) {
      this.sjekkErrorOgVisFeilmelding(error);
    }
  };

  touchAll = (formName, alleFeil = {}) => {
    this.props.touch(formName, ...Object.keys(alleFeil));
  };

  resetSkjemaFelterForOpprettFagsak = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold("sakstype", null);
    settFeltInnhold("sakstema", null);
    settFeltInnhold("opprettnysak_behandlingstema", null);
    settFeltInnhold("opprettnysak_behandlingstype", null);
    settFeltInnhold("journalforingPeriodeFraOgMed", null);
    settFeltInnhold("journalforingPeriodeTilOgMed", null);
    settFeltInnhold("journalforingSoknadsland", []);
    settFeltInnhold("journalforingSoknadslandFlereLandUkjentHvilke", false);
  };

  resetSkjemaFelterForEksisterendeSaker = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold("behandlingstype", null);
    settFeltInnhold("behandlingstema", null);
  };

  velgDokumentID = () => {
    const { valgtDokumentID } = this.state;
    const {
      journalforing: { hoveddokument = {} },
    } = this.props;
    if (valgtDokumentID === -1 && !hoveddokument.dokumentID) return null;
    if (valgtDokumentID === -1 && hoveddokument.dokumentID) return hoveddokument.dokumentID;
    return valgtDokumentID;
  };

  submitJournalforingNormal = async () => {
    try {
      this.setState({ submitSpinner: true });
      const refreshOversiktDelayMillis = 2500;
      const { saksnummer } = this.props.journalforingSkjemaVerdier;
      if (saksnummer === "-1") {
        await this.opprettFagsak();
      } else {
        await this.knyttTilEksisterendeSak();
      }
      // Hent oppgave-oversikten som vises på forsiden når journalføringsprosessen forhåpentligvis er ferdigstilt
      setTimeout(() => this.props.hentOppgaveOversikt(), refreshOversiktDelayMillis);
      setTimeout(() => this.props.hentOppgaveOversikt(), refreshOversiktDelayMillis * 2);
    } finally {
      this.setState({ submitSpinner: false });
    }
  };

  journalforSed = async () => {
    const {
      tilForsiden,
      journalforSEDSkjemaIsValid,
      journalforSEDSkjemaVerdier: { brukerID },
      journalforSEDSkjemaErrors,
      match,
    } = this.props;

    const { oppgaveID, journalpostID } = match.params;

    this.touchAll(KV.Form.JOURNALFORING_SED, journalforSEDSkjemaErrors);
    if (!journalforSEDSkjemaIsValid) return;

    const data = {
      brukerID,
      journalpostID,
      oppgaveID,
    };

    try {
      await Api.Journalforing.sed(data);
      this.setState({ visFeilmeldingDialog: false });
      return tilForsiden();
    } catch (error) {
      this.sjekkErrorOgVisFeilmelding(error);
    }
  };

  submitJournalforingSED = async () => {
    this.setState({ submitSpinner: true });
    await this.journalforSed();
    this.setState({ submitSpinner: false });
  };

  render() {
    const {
      journalforing: {
        vedlegg = [],
        hoveddokument = {},
        behandlingsInformasjon,
        avsenderID,
        avsenderNavn,
        mottaksKanalErEessi,
        mottaksKanalErElektronisk,
      },
      settFeltInnhold,
    } = this.props;

    const { visFeilmeldingDialog, feilmeldinger, submitSpinner } = this.state;

    const { journalpostID } = this.props.match.params;
    const { dokumentID: hoveddokumentID, tittel: hoveddokumentTittel = "Hoveddokument" } = hoveddokument;

    const visSedJournalforing = Utils._isObject(behandlingsInformasjon);
    const visNormalJournalforing = behandlingsInformasjon === null;

    return (
      <>
        <div className="journalforing">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="6" lg="5">
                <Sticky>
                  <div className="panel journalforing__skjema">
                    <div className="journalforing__skjema__scroll">
                      {visSedJournalforing && (
                        <JournalforingSED
                          avsenderID={avsenderID}
                          avsenderNavn={avsenderNavn}
                          behandlingstema={behandlingsInformasjon?.behandlingstema}
                          sakstype={behandlingsInformasjon?.sakstype}
                          submitSpinner={submitSpinner}
                          submitJournalforing={this.submitJournalforingSED}
                          avbrytJournalforing={this.avbrytJournalforing}
                        />
                      )}
                      {visNormalJournalforing && (
                        <JournalforingForm
                          avsenderIDFraJournalpost={avsenderID}
                          avsenderNavnFraJournalpost={avsenderNavn}
                          mottaksKanalErEessi={mottaksKanalErEessi}
                          journalpostID={journalpostID}
                          hoveddokumentID={hoveddokumentID}
                          hoveddokumentTittel={hoveddokumentTittel}
                          vedlegg={vedlegg}
                          submitSpinner={submitSpinner}
                          submitJournalforing={this.submitJournalforingNormal}
                          avbrytJournalforing={this.avbrytJournalforing}
                          settFeltInnhold={settFeltInnhold}
                          mottaksKanalErElektronisk={mottaksKanalErElektronisk}
                        />
                      )}
                    </div>
                  </div>
                </Sticky>
              </Nav.Column>
              <Nav.Column xs="6" lg="7" className="journalforing__dokument">
                {vedlegg.length > 0 && (
                  <div className="panel">
                    <Nav.Select
                      className="journalforing__vedlegg_velger"
                      name="journalforing_pdf_dokumenter"
                      label="Dokumentvisning"
                      defaultValue={hoveddokumentID}
                      onChange={this.onChangeVedlegg}
                    >
                      <option key={hoveddokumentID} value={hoveddokumentID}>
                        {hoveddokumentTittel}
                      </option>
                      {vedlegg.map((elem) => (
                        <option key={elem.dokumentID} value={elem.dokumentID}>
                          {elem.tittel}
                        </option>
                      ))}
                    </Nav.Select>
                  </div>
                )}
                {this.velgDokumentID() && (
                  <div className="panel journalforing__dokument_visning">
                    <PDFDokument journalpostID={journalpostID} dokumentID={this.velgDokumentID()} />
                  </div>
                )}
              </Nav.Column>
            </Nav.Row>
          </Nav.Container>
        </div>
        {visFeilmeldingDialog && (
          <FeilmeldingDialog avbryt={this.skjulFeilmeldingDialogOgResetFeilmeldinger} feilmeldinger={feilmeldinger} />
        )}
      </>
    );
  }
}

Journalforing.propTypes = {
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  hentJournalOppgave: PT.func.isRequired,
  settFeltInnhold: PT.func.isRequired,
  settJournalforingHensikt: PT.func.isRequired,
  journalforing: MPT.Journalforing,
  journalforingSkjemaVerdier: MPT.JournalforingSkjemaVerdier,
  errors: PT.object.isRequired,
  touch: PT.func.isRequired,
  vedleggsdokumenter: PT.arrayOf(
    PT.shape({ tittel: PT.string, dokumentID: PT.string, logiskeVedlegg: PT.arrayOf(PT.string) }),
  ).isRequired,
  tilForsiden: PT.func.isRequired,
  journalforSEDSkjemaIsValid: PT.bool.isRequired,
  journalforSEDSkjemaVerdier: PT.object,
  journalforSEDSkjemaErrors: PT.object.isRequired,
  resetJournalforingState: PT.func.isRequired,
  hentLandkoder: PT.func.isRequired,
  hentOppgaveOversikt: PT.func.isRequired,
};

Journalforing.defaultProps = {
  journalforing: {},
  journalforingSkjemaVerdier: {},
  journalforSEDSkjemaVerdier: {},
};

const mapStateToProps = (state) => ({
  journalforing: journalforingSelectors.JournalforingAlle(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  vedleggsdokumenter: journalforingSelectors.JournalforingVedleggsDokumenter(state),
  errors: getFormSyncErrors(KV.Form.JOURNALFORING)(state),
  journalforSEDSkjemaIsValid: isValid(KV.Form.JOURNALFORING_SED)(state),
  journalforSEDSkjemaVerdier: getFormValues(KV.Form.JOURNALFORING_SED)(state),
  journalforSEDSkjemaErrors: getFormSyncErrors(KV.Form.JOURNALFORING_SED)(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentJournalOppgave: (journalpostID) => dispatch(journalforingOperations.hent(journalpostID)),
  settFeltInnhold: (feltNavn, verdi) => dispatch(autofill(KV.Form.JOURNALFORING, feltNavn, verdi)),
  settJournalforingHensikt: (journalforingHensikt) =>
    dispatch(change(KV.Form.JOURNALFORING, "journalforingHensikt", journalforingHensikt)),
  touch: (formName, ...fields) => dispatch(touch(formName, ...fields)),
  resetJournalforingState: () => dispatch(journalforingOperations.resetJournalforing()),
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
  hentOppgaveOversikt: () => dispatch(oppgaverOperations.oversikt()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Journalforing));
