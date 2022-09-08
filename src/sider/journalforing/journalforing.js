/* eslint no-alert:off, consistent-return:off */
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { autofill, setSubmitFailed, change, getFormSyncErrors, touch, isValid, getFormValues } from "redux-form";
import PT from "prop-types";

import MKV from "../../melosyskodeverk";

import * as KV from "../../kodeverk";
import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";
import * as Api from "../../services/api";
import * as MPT from "../../proptypes";
import { JOURNALFORING_HENSIKT } from "../../constants";

import { erFeatureToggleEnabled } from "../../featuretoggle";
import Sticky from "../../felleskomponenter/sticky";
import PDFDokument from "./komponenter/pdfdokument";
import JournalforingSED from "./komponenter/journalforingsed";
import JournalforingForm from "./komponenter/journalforingform";
import FeilmeldingDialog from "./komponenter/feilmeldingDialog";

import { journalforingOperations, journalforingSelectors } from "../../ducks/journalforing";
import { landkoderOperations } from "../../ducks/landkoder";
import { formSelectors } from "../../ducks/form";
import { sokSelectors } from "../../ducks/sok";

import "./journalforing.css";

class Journalforing extends Component {
  state = {
    valgtDokumentID: -1,
    visFeilmeldingDialog: false,
    feilmeldinger: [],
    submitSpinner: false,
    sakstemaToggleEnabled: false,
    toggleHentet: false, // Kan fjernes når melosys.sakstema toggle fjernes
  };
  async componentDidMount() {
    const { journalpostID } = this.props.match.params;
    await this.props.hentJournalOppgave(journalpostID);
    const toggleEnabled = await erFeatureToggleEnabled("melosys.sakstema");
    this.setState({ sakstemaToggleEnabled: toggleEnabled, toggleHentet: true });
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
  /** Ikke all informasjon som vises i skjemaet skal sendes tilbake til backend. Et eksempel på det er dato som
   * settes inn i skjemaet kun til info - ikke til endring - slik som feks navn på bruker.
   * Derfor må vi bygge opp og evt vaske et nytt objekt som kan sendes til backend.
   *
   * @returns {object} Objektet som skal sendes videre som payload.
   */
  vaskDokumentInformasjon = (hensikt) => {
    /* eslint-disable no-console */
    console.assert(hensikt, { message: "hensikt må ha verdi" });
    /* eslint-enable no-console */
    const { oppgaveID, journalpostID } = this.props.match.params;
    const {
      journalforingSkjemaVerdier,
      journalforing: { hoveddokument = {} },
    } = this.props;
    const {
      brukerID,
      virksomhetOrgnr,
      avsenderID,
      arbeidsgiverID,
      opprettnysak_behandlingstema,
      opprettnysak_behandlingstype,
      behandlingstema,
      behandlingstype,
      representantID,
      representantKontaktPerson,
      representantRepresenterer,
      avsenderNavn,
      hoveddokument: { tittel, logiskeVedlegg },
      vedlegg: vedleggSkjema,
      skalTilordnes,
      ikkeSendForvaltingsmelding,
      mottattDato,
    } = journalforingSkjemaVerdier;

    const { dokumentID } = hoveddokument;
    const vedlegg = [...this.mapFysiskeVedleggsTitlerTilVedlegg(vedleggSkjema.pdf)];

    // Data for hensikt KNYTT/NY_VURDERING
    let journalPostData = {
      avsenderID,
      avsenderNavn,
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
    };
    if (hensikt === JOURNALFORING_HENSIKT.KNYTT || hensikt === JOURNALFORING_HENSIKT.NY_VURDERING) {
      journalPostData = {
        ...journalPostData,
        ikkeSendForvaltingsmelding: null,
        behandlingstemaKode: behandlingstema,
        behandlingstypeKode: behandlingstype,
      };
    }
    // /Hensikt OPPRETT har flere felt
    if (hensikt === JOURNALFORING_HENSIKT.OPPRETT) {
      journalPostData = Object.assign(journalPostData, {
        arbeidsgiverID,
        behandlingstemaKode: opprettnysak_behandlingstema,
        behandlingstypeKode: opprettnysak_behandlingstype,
        representantID,
        representantKontaktPerson: Utils.verdiSomNullable(representantKontaktPerson),
        representererKode: representantRepresenterer,
        ikkeSendForvaltingsmelding,
      });
    }
    return journalPostData;
  };

  organisasjonAliaser = [
    KV.AvsenderTyper.FULLMEKTIG,
    KV.AvsenderTyper.ARBEIDSGIVER,
    MKV.Koder.avsendertyper.ORGANISASJON,
  ];

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
    /* eslint no-unreachable:off */
    const {
      journalforingSkjemaVerdier: { saksnummer, behandlingstype, ingenVurdering, avsenderType },
      settJournalforingHensikt,
      settFeilFelt,
      tilForsiden,
    } = this.props;
    const hensikt = behandlingstype ? JOURNALFORING_HENSIKT.NY_VURDERING : JOURNALFORING_HENSIKT.KNYTT;

    const { resetSkjemaFelterForOpprettFagsak } = this;
    const vasketJournalforing = this.vaskDokumentInformasjon(hensikt);
    const journalforingData = {
      saksnummer,
      ingenVurdering,
      avsenderType: this.organisasjonAliaser.includes(avsenderType)
        ? MKV.Koder.avsendertyper.ORGANISASJON
        : avsenderType,
      ...vasketJournalforing,
    };

    await settJournalforingHensikt(hensikt);

    this.touchAll(KV.Form.JOURNALFORING, this.props.errors);

    // Tøm den delen av skjema som ikke skal brukes.
    resetSkjemaFelterForOpprettFagsak();

    if (!Utils._isEmpty(this.props.errors)) {
      settFeilFelt("avsenderNavn", "vedleggsTitler", "saksnummer", "behandlingstype");
      return false;
    }

    try {
      if (hensikt === JOURNALFORING_HENSIKT.NY_VURDERING) {
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
    const { journalforingSkjemaVerdier, settJournalforingHensikt, settFeilFelt, tilForsiden } = this.props;

    const { resetSkjemaFelterForEksisterendeSaker } = this;
    const {
      journalforingSoknadsland,
      journalforingSoknadslandUkjenteEllerAlleEosLand,
      journalforingPeriodeFraOgMed,
      journalforingPeriodeTilOgMed,
      avsenderType,
    } = journalforingSkjemaVerdier;

    await settJournalforingHensikt(JOURNALFORING_HENSIKT.OPPRETT);

    this.touchAll(KV.Form.JOURNALFORING, this.props.errors);

    // Tøm den delen av skjema som ikke skal brukes.
    resetSkjemaFelterForEksisterendeSaker();

    if (!Utils._isEmpty(this.props.errors)) {
      settFeilFelt("journalforingPeriodeFraOgMed", "journalforingPeriodeTilOgMed", "journalforingSoknadsland");
      return false;
    }

    const fom = journalforingPeriodeFraOgMed ? Utils.dato.formatterDatoTilISO(journalforingPeriodeFraOgMed) : null;
    const tom = journalforingPeriodeTilOgMed ? Utils.dato.formatterDatoTilISO(journalforingPeriodeTilOgMed) : null;
    const fagsak = {
      sakstype: journalforingSkjemaVerdier.sakstype,
      sakstema: journalforingSkjemaVerdier.sakstema,
      soknadsperiode: {
        fom,
        tom,
      },
      land: {
        landkoder: journalforingSoknadsland || [],
        erUkjenteEllerAlleEosLand: journalforingSoknadslandUkjenteEllerAlleEosLand,
      },
    };

    const vasketJournalforing = this.vaskDokumentInformasjon(JOURNALFORING_HENSIKT.OPPRETT);
    const journalforingData = {
      ...vasketJournalforing,
      fagsak,
      avsenderType: this.organisasjonAliaser.includes(avsenderType)
        ? MKV.Koder.avsendertyper.ORGANISASJON
        : avsenderType,
    };

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
    settFeltInnhold("journalforingPeriodeFraOgMed", "");
    settFeltInnhold("journalforingPeriodeTilOgMed", "");
    settFeltInnhold("representantID", null);
    settFeltInnhold("journalforingSoknadsland", []);
    settFeltInnhold("journalforingSoknadslandUkjenteEllerAlleEosLand", false);
  };

  resetSkjemaFelterForEksisterendeSaker = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold("behandlingstype", "");
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

  submitJournalforing = async () => {
    this.setState({ submitSpinner: true });
    const { journalforingSkjemaVerdier, journalforSEDSkjemaVerdier } = this.props;
    if (journalforSEDSkjemaVerdier.brukerID) {
      this.journalforSed();
    } else {
      const { saksnummer } = journalforingSkjemaVerdier;
      if (saksnummer === "-1") {
        await this.opprettFagsak();
      } else {
        await this.knyttTilEksisterendeSak();
      }
    }
    this.setState({ submitSpinner: false });
  };

  kanSubmittes = () => {
    const { journalforSEDSkjemaVerdier } = this.props;
    if (journalforSEDSkjemaVerdier.brukerID) {
      return true;
    }
    return !Utils._isEmpty(this.props.journalforingSkjemaVerdier.saksnummer);
  };

  render() {
    const {
      journalforing: { vedlegg = [], hoveddokument = {}, behandlingsInformasjon, avsenderID, avsenderNavn },
      fagsakListe,
      settFeltInnhold,
    } = this.props;

    const { visFeilmeldingDialog, feilmeldinger, submitSpinner, sakstemaToggleEnabled, toggleHentet } = this.state;

    const { knyttTilEksisterendeSak, opprettFagsak } = this;
    const { journalpostID } = this.props.match.params;
    const { dokumentID: hoveddokumentID, tittel: hoveddokumentTittel = "Hoveddokument" } = hoveddokument;
    const { behandlingstema, sakstype } = behandlingsInformasjon || {};

    const visSedJournalforing = Utils._isObject(behandlingsInformasjon);
    const visNormalJournalforing = behandlingsInformasjon === null && toggleHentet;

    return (
      <>
        <div className="journalforing">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="4">
                <Nav.Typo.Sidetittel className="journalforing__sidetittel">Journalføring</Nav.Typo.Sidetittel>
              </Nav.Column>
            </Nav.Row>
            <Nav.Row>
              <Nav.Column xs="4">
                <Sticky>
                  <Nav.Panel className="journalforing__skjema">
                    <div className="journalforing__skjema__scroll">
                      {visSedJournalforing && (
                        <JournalforingSED
                          avsenderID={avsenderID}
                          avsenderNavn={avsenderNavn}
                          behandlingstema={behandlingstema}
                          sakstype={sakstype}
                          submitSpinner={submitSpinner}
                          submitJournalforing={this.submitJournalforing}
                          avbrytJournalforing={this.avbrytJournalforing}
                          kanSubmittes={this.kanSubmittes()}
                        />
                      )}
                      {visNormalJournalforing && (
                        <JournalforingForm
                          journalpostID={journalpostID}
                          hoveddokumentID={hoveddokumentID}
                          hoveddokumentTittel={hoveddokumentTittel}
                          vedlegg={vedlegg}
                          fagsakListe={fagsakListe}
                          knyttTilEksisterendeSak={knyttTilEksisterendeSak}
                          opprettFagsak={opprettFagsak}
                          submitSpinner={submitSpinner}
                          submitJournalforing={this.submitJournalforing}
                          avbrytJournalforing={this.avbrytJournalforing}
                          kanSubmittes={this.kanSubmittes()}
                          settFeltInnhold={settFeltInnhold}
                          sakstemaToggleEnabled={sakstemaToggleEnabled}
                        />
                      )}
                    </div>
                  </Nav.Panel>
                </Sticky>
              </Nav.Column>
              <Nav.Column xs="8">
                {vedlegg.length > 0 && (
                  <Nav.Panel>
                    <Nav.Select
                      className="journalforing__dokument_visning"
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
                  </Nav.Panel>
                )}
                {this.velgDokumentID() && (
                  <Nav.Panel>
                    <PDFDokument journalpostID={journalpostID} dokumentID={this.velgDokumentID()} />
                  </Nav.Panel>
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
  settFeilFelt: PT.func.isRequired,
  settJournalforingHensikt: PT.func.isRequired,
  journalforing: MPT.Journalforing,
  journalforingSkjemaVerdier: MPT.JournalforingSkjemaVerdier,
  fagsakListe: PT.array,
  errors: PT.object.isRequired,
  touch: PT.func.isRequired,
  vedleggsdokumenter: PT.arrayOf(
    PT.shape({ tittel: PT.string, dokumentID: PT.string, logiskeVedlegg: PT.arrayOf(PT.string) })
  ).isRequired,
  tilForsiden: PT.func.isRequired,
  journalforSEDSkjemaIsValid: PT.bool.isRequired,
  journalforSEDSkjemaVerdier: PT.object,
  journalforSEDSkjemaErrors: PT.object.isRequired,
  resetJournalforingState: PT.func.isRequired,
  hentLandkoder: PT.func.isRequired,
};

Journalforing.defaultProps = {
  journalforing: {},
  fagsakListe: [],
  journalforingSkjemaVerdier: {},
  journalforSEDSkjemaVerdier: {},
};

const mapStateToProps = (state) => ({
  journalforing: journalforingSelectors.JournalforingAlle(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  fagsakListe: sokSelectors.FagsakSokSelector(state),
  vedleggsdokumenter: journalforingSelectors.JournalforingVedleggsDokumenter(state),
  errors: getFormSyncErrors(KV.Form.JOURNALFORING)(state),
  journalforSEDSkjemaIsValid: isValid(KV.Form.JOURNALFORING_SED)(state),
  journalforSEDSkjemaVerdier: getFormValues(KV.Form.JOURNALFORING_SED)(state),
  journalforSEDSkjemaErrors: getFormSyncErrors(KV.Form.JOURNALFORING_SED)(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentJournalOppgave: (journalpostID) => dispatch(journalforingOperations.hent(journalpostID)),
  settFeltInnhold: (feltNavn, verdi) => dispatch(autofill(KV.Form.JOURNALFORING, feltNavn, verdi)),
  settFeilFelt: (...feltNavn) => setSubmitFailed(KV.Form.JOURNALFORING, ...feltNavn),
  settJournalforingHensikt: (journalforingHensikt) =>
    dispatch(change(KV.Form.JOURNALFORING, "journalforingHensikt", journalforingHensikt)),
  touch: (formName, ...fields) => dispatch(touch(formName, ...fields)),
  resetJournalforingState: () => dispatch(journalforingOperations.resetJournalforing()),
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Journalforing));
