/* eslint no-alert:off, consistent-return:off */
import React, { Component, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { autofill, setSubmitFailed, change, getFormSyncErrors, touch, isValid, getFormValues } from 'redux-form';
import PT from 'prop-types';

import MKV from '../../melosyskodeverk';

import * as KV from '../../kodeverk';
import * as Utils from '../../utils';
import * as Nav from '../../utils/navFrontend';
import * as Api from '../../services/api';
import { JOURNALFORING_HENSIKT, ANTALL_TALL_I_ORGNR } from '../../constants';

import * as Person from '../../felleskomponenter/skjema/validering/generisk/person';

import Sticky from '../../felleskomponenter/sticky';
import withErrorHandling from '../../felleskomponenter/withErrorHandling';
import PDFDokument from './komponenter/pdfdokument';
import JournalforingSED from './komponenter/journalforingsed';
import JournalforingForm from './komponenter/journalforingform';
import { queryParamLogger } from '../../utils/queryParamLogger';

import {
  journalforingOperations,
  journalforingSelectors,
} from '../../ducks/journalforing';
import { formSelectors } from '../../ducks/form';
import { OrganisasjonOperations } from '../../ducks/organisasjoner';
import { PersonOperations } from '../../ducks/personer';
import * as MPT from '../../proptypes';
import { sokOperations, sokSelectors } from '../../ducks/sok';

import './journalforing.css';

class Journalforing extends Component {
  state = {
    valgtDokumentID: -1,
  };
  async componentDidMount() {
    const { journalpostID } = this.props.match.params;
    queryParamLogger(this.props.location, 'kilde', 'GOSYS');
    await this.props.hentJournalOppgave(journalpostID);
  }

  onChangeVedlegg = e => {
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
  mapLogiskeVedleggsTitlerTilVedlegg = titler => {
    const dokumentID = null;
    return titler.map(tittel => ({ dokumentID, tittel }));
  };
  mapFysiskeVedleggsTitlerTilVedlegg = pdf => {
    const { vedleggsdokumenter } = this.props;
    if (!vedleggsdokumenter || vedleggsdokumenter.length === 0) return [];
    const pdfTitler = Object.values(pdf);
    if (pdfTitler.length === 0) return [];
    return pdfTitler.map((tittel, index) => {
      const { dokumentID } = vedleggsdokumenter[index];
      return ({ dokumentID, tittel });
    });
  };
  /** Ikke all informasjon som vises i skjemaet skal sendes tilbake til backend. Et eksempel på det er dato som
   * settes inn i skjemaet kun til info - ikke til endring - slik som feks navn på bruker.
   * Derfor må vi bygge opp og evt vaske et nytt objekt som kan sendes til backend.
   *
   * @returns {object} Objektet som skal sendes videre som payload.
   */
  vaskDokumentInformasjon = intensjon => {
    /* eslint-disable no-console */
    console.assert(intensjon, { message: 'intensjon må ha verdi' });
    /* eslint-enable no-console */
    const { oppgaveID, journalpostID } = this.props.match.params;
    const {
      journalforingSkjemaVerdier,
      journalforing: { hoveddokument = {} },
    } = this.props;
    const {
      brukerID, avsenderID, arbeidsgiverID,
      opprettnysak_behandlingstype: behandlingstypeKode,
      representantID, representantKontaktPerson, fullmektigRepresenterer, avsenderNavn, hoveddokumentTittel, vedlegg: vedleggSkjema,
      skalTilordnes,
      ikkeSendForvaltingsmelding,
      mottattDato,
    } = journalforingSkjemaVerdier;

    const { dokumentID } = hoveddokument;
    const vedlegg = [...this.mapFysiskeVedleggsTitlerTilVedlegg(vedleggSkjema.pdf), ...this.mapLogiskeVedleggsTitlerTilVedlegg(vedleggSkjema.logiskeTitler)];

    // Data for /tilordne i.e KNYTT
    let journalPostData = {
      avsenderID,
      avsenderNavn,
      brukerID,
      dokumentID,
      hoveddokumentTittel,
      journalpostID,
      oppgaveID,
      vedlegg,
      skalTilordnes,
      mottattDato: Utils.dato.formatterDatoTilISO(mottattDato),
    };
    if (intensjon === JOURNALFORING_HENSIKT.KNYTT) {
      journalPostData = { ...journalPostData, ikkeSendForvaltingsmelding: null };
    }
    // /opprett har i tillegg arbeidsgiverID og representantID
    if (intensjon === JOURNALFORING_HENSIKT.OPPRETT) {
      journalPostData = Object.assign(journalPostData, {
        arbeidsgiverID,
        behandlingstypeKode,
        representantID,
        representantKontaktPerson: Utils.verdiSomNullable(representantKontaktPerson),
        fullmektigRepresenterer,
        ikkeSendForvaltingsmelding,
      });
    }
    return journalPostData;
  };

  /** Når saksbehandler klikker "knytt til eksisterende sak" skal det åpnes for validering av
   * relevante felter før saken tilordnes (sendes til API) og saksbehandler returneres til forsiden.
   * @returns {boolean}
   */
  knyttTilEksisterendeSak = async () => {
    /* eslint no-unreachable:off */
    const {
      journalforingSkjemaVerdier: {
        saksnummer, behandlingstype: behandlingstypeKode, ingenVurdering, avsenderType,
      },
      tilordneSak, settJournalforingHensikt, settFeilFelt, tilForsiden,
    } = this.props;

    const { resetSkjemaFelterForOpprettFagsak } = this;
    const organisasjonAliaser = ['FULLMEKTIG', 'ARBEIDSGIVER', 'ARBEIDSGIVER_FULLMEKTIG', MKV.Koder.avsendertyper.ORGANISASJON];
    const vasketJournalforing = this.vaskDokumentInformasjon(JOURNALFORING_HENSIKT.KNYTT);
    const journalforingData = {
      saksnummer,
      behandlingstypeKode,
      ingenVurdering,
      avsenderType: organisasjonAliaser.includes(avsenderType) ? MKV.Koder.avsendertyper.ORGANISASJON : avsenderType,
      ...vasketJournalforing,
    };

    await settJournalforingHensikt(JOURNALFORING_HENSIKT.KNYTT);

    this.touchAll(KV.Form.JOURNALFORING, this.props.errors);

    // Tøm den delen av skjema som ikke skal brukes.
    resetSkjemaFelterForOpprettFagsak();

    if (!Utils._isEmpty(this.props.errors)) {
      settFeilFelt('avsenderNavn', 'vedleggsTitler', 'saksnummer', 'behandlingstype');
      return false;
    }
    const response = await tilordneSak(journalforingData);
    if (response.ok) {
      tilForsiden();
    }
  };

  /** Når saksbehandler klikker "opprett sak" skal det åpnes for validering av
   * relevante felter før ny sak opprettes (sendes til API) og saksbehandler returneres til forsiden.
   * @returns {boolean}
   */
  opprettFagsak = async () => {
    const {
      journalforingSkjemaVerdier, opprettNySak, settJournalforingHensikt, settFeilFelt, tilForsiden,
    } = this.props;

    const { resetSkjemaFelterForEksisterendeSaker } = this;
    const {
      journalforingSoknadsland,
      journalforingPeriodeFraOgMed,
      journalforingPeriodeTilOgMed,
      journalforingLovvalgsbestemmelse,
      journalforingUnntakFraLovvalgsbestemmelse,
      journalforingUnntakFraLovvalgsland,
      avsenderType,
    } = journalforingSkjemaVerdier;

    await settJournalforingHensikt(JOURNALFORING_HENSIKT.OPPRETT);

    this.touchAll(KV.Form.JOURNALFORING, this.props.errors);

    // Tøm den delen av skjema som ikke skal brukes.
    resetSkjemaFelterForEksisterendeSaker();

    if (!Utils._isEmpty(this.props.errors)) {
      settFeilFelt(
        'journalforingPeriodeFraOgMed',
        'journalforingPeriodeTilOgMed',
        'journalforingSoknadsland',
        'journalforingLovvalgsbestemmelse',
        'journalforingUnntakFraLovvalgsbestemmelse',
        'journalforingUnntakFraLovvalgsland'
      );
      return false;
    }

    const fom = journalforingPeriodeFraOgMed ? Utils.dato.formatterDatoTilISO(journalforingPeriodeFraOgMed) : null;
    const tom = journalforingPeriodeTilOgMed ? Utils.dato.formatterDatoTilISO(journalforingPeriodeTilOgMed) : null;
    const fagsak = {
      sakstype: MKV.Koder.sakstyper.EU_EOS,
      soknadsperiode: {
        fom,
        tom,
      },
      land: journalforingSoknadsland || [],
    };

    const anmodningOmUnntak = {
      lovvalgsbestemmelse: journalforingLovvalgsbestemmelse || null,
      unntakFraLovvalgsbestemmelse: journalforingUnntakFraLovvalgsbestemmelse || null,
      unntakFraLovvalgsland: journalforingUnntakFraLovvalgsland || null,
    };

    const vasketJournalforing = this.vaskDokumentInformasjon(JOURNALFORING_HENSIKT.OPPRETT);
    const journalforingData = {
      ...vasketJournalforing,
      fagsak,
      anmodningOmUnntak,
      avsenderType: this.mapAvsenderType(avsenderType),
    };
    const response = await opprettNySak(journalforingData);
    if (response.ok) {
      tilForsiden();
    }
  };

  mapAvsenderType = avsenderType => {
    switch (avsenderType) {
      case 'ARBEIDSGIVER':
      case 'ARBEIDSGIVER_FULLMEKTIG':
      case 'FULLMEKTIG':
        return MKV.Koder.avsendertyper.ORGANISASJON;
      default:
        return avsenderType;
    }
  };

  /** Vi ønsker kun å gjøre et søk på brukerID dersom det er et gyldig FNR eller DNR.
   * Derfor, sjekk dette før vi evt kaller sokFnrDnr.
   * @param brukerID {string} Verdien vi ønsker å sjekke på.
   */
  hentOgVisBruker = async brukerID => {
    if (!Person.erGyldigFnr(brukerID) && !Person.erGyldigDnr(brukerID)) { return; }

    const { sokFnrDnr, settFeltInnhold, hentFagsakListe } = this.props;
    settFeltInnhold('brukerNavn', '');
    const response = await sokFnrDnr(brukerID);
    if (!response || !response.data) { return false; }
    const { sammensattNavn = '' } = response.data;
    if (!sammensattNavn) { return false; }
    settFeltInnhold('brukerNavn', sammensattNavn);
    await hentFagsakListe(brukerID);
    return { brukerID, sammensattNavn };
  };

  /** Vi ønsker kun å gjøre et søk på avsenderID dersom antall tegn matcher enten 9 (orgnr) eller er et gyldig FNR || DNR.
   * Avsender kan være både person og organisasjon.
   * @param value {string} Verdien vi ønsker å sjekke på.
   */
  hentOgVisAvsender = async value => {
    const { sokOrgnr, sokFnrDnr, settFeltInnhold } = this.props;

    if (!value) { return; }

    if (value.length === ANTALL_TALL_I_ORGNR) {
      settFeltInnhold('avsenderNavn', '');
      const response = await sokOrgnr(value);
      if (!response || !response.data) { return false; }
      const { navn = '' } = response.data;
      settFeltInnhold('avsenderNavn', navn);
    }

    if (Person.erGyldigFnr(value) || Person.erGyldigDnr(value)) {
      settFeltInnhold('avsenderNavn', '');
      const response = await sokFnrDnr(value);
      if (!response || !response.data) { return false; }
      const { sammensattNavn = '' } = response.data;
      settFeltInnhold('avsenderNavn', sammensattNavn);
    }
  };


  hentOgVisRepresentant = async value => {
    const { sokOrgnr, settFeltInnhold } = this.props;

    if (!value) { return; }

    if (value.length === ANTALL_TALL_I_ORGNR) {
      settFeltInnhold('representantNavn', '');
      const response = await sokOrgnr(value);
      if (!response.data) { return false; }
      const { navn = '' } = response.data;
      settFeltInnhold('representantNavn', navn);
    }
  };

  touchAll = (formName, alleFeil = {}) => {
    this.props.touch(formName, ...Object.keys(alleFeil));
  };

  resetSkjemaFelterForOpprettFagsak = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold('journalforingPeriodeFraOgMed', '');
    settFeltInnhold('journalforingPeriodeTilOgMed', '');
    settFeltInnhold('representantID', '');
    settFeltInnhold('journalforingSoknadsland', []);
    settFeltInnhold('journalforingLovvalgsbestemmelse', '');
    settFeltInnhold('journalforingUnntakFraLovvalgsbestemmelse', '');
    settFeltInnhold('journalforingUnntakFraLovvalgsland', '');
  };

  resetSkjemaFelterForEksisterendeSaker = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold('behandlingstype', '');
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
      journalforSEDSkjemaVerdier: {
        brukerID,
      },
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
      tilForsiden();
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  submitJournalforing = () => {
    const {
      journalforingSkjemaVerdier, journalforSEDSkjemaVerdier,
    } = this.props;
    if (journalforSEDSkjemaVerdier.brukerID) {
      this.journalforSed();
    } else {
      const { saksnummer } = journalforingSkjemaVerdier;
      if (saksnummer === '-1') {
        this.opprettFagsak();
      } else {
        this.knyttTilEksisterendeSak();
      }
    }
  };

  kanSubmittes = () => {
    const { journalforSEDSkjemaVerdier } = this.props;
    if (journalforSEDSkjemaVerdier.brukerID) {
      return true;
    }
    return !Utils._isEmpty(this.props.journalforingSkjemaVerdier.saksnummer);
  };

  behandlingstyper = [
    ...MKV.KTObjects.behandlinger.behandlingstyper
      .filter(({ kode }) =>
        kode === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD ||
        kode === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_IKKE_YRKESAKTIV ||
        kode === MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE ||
        kode === MKV.Koder.behandlinger.behandlingstyper.ANMODNING_OM_UNNTAK_HOVEDREGEL ||
        kode === MKV.Koder.behandlinger.behandlingstyper.VURDER_TRYGDETID ||
        kode === MKV.Koder.behandlinger.behandlingstyper.ØVRIGE_SED),
  ];

  render() {
    const {
      journalforing: {
        vedlegg = [],
        hoveddokument = {},
        behandlingsInformasjon,
        avsenderID,
        avsenderNavn = '',
      },
      fagsakListe,
    } = this.props;

    const {
      knyttTilEksisterendeSak, opprettFagsak, hentOgVisAvsender, hentOgVisBruker, hentOgVisRepresentant,
    } = this;
    const { journalpostID } = this.props.match.params;
    const { dokumentID: hoveddokumentID, tittel: hoveddokumentTittel = 'Hoveddokument' } = hoveddokument;
    const {
      behandlingstype,
      sakstype,
    } = behandlingsInformasjon || {};

    const visSedJournalforing = Utils._isObject(behandlingsInformasjon);
    const visNormalJournalforing = behandlingsInformasjon === null;

    return (
      <div className="journalforing">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="4">
              <Nav.typo.Sidetittel className="journalforing__sidetittel">Journalføring</Nav.typo.Sidetittel>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="4">
              <Sticky>
                <Nav.Panel className="journalforing__skjema">
                  <div className="journalforing__skjema__scroll">
                    {
                      visSedJournalforing &&
                      <JournalforingSED
                        avsenderID={avsenderID}
                        avsenderNavn={avsenderNavn}
                        behandlingstype={behandlingstype}
                        sakstype={sakstype}
                        submitJournalforing={this.submitJournalforing}
                        avbrytJournalforing={this.avbrytJournalforing}
                        kanSubmittes={this.kanSubmittes()}
                      />
                    }
                    {
                      visNormalJournalforing &&
                      <JournalforingForm
                        journalpostID={journalpostID}
                        hoveddokumentID={hoveddokumentID}
                        hoveddokumentTittel={hoveddokumentTittel}
                        vedlegg={vedlegg}
                        hentOgVisAvsender={hentOgVisAvsender}
                        hentOgVisBruker={hentOgVisBruker}
                        fagsakListe={fagsakListe}
                        knyttTilEksisterendeSak={knyttTilEksisterendeSak}
                        opprettFagsak={opprettFagsak}
                        hentOgVisRepresentant={hentOgVisRepresentant}
                        behandlingstyper={this.behandlingstyper}
                        submitJournalforing={this.submitJournalforing}
                        avbrytJournalforing={this.avbrytJournalforing}
                        kanSubmittes={this.kanSubmittes()}
                      />
                    }
                  </div>
                </Nav.Panel>
              </Sticky>
            </Nav.Column>
            <Nav.Column xs="8">
              {vedlegg.length > 0 &&
                <Nav.Panel>
                  <Nav.Select
                    className="journalforing__dokument_visning"
                    name="journalforing_pdf_dokumenter"
                    label="Dokumentvisning"
                    defaultValue={hoveddokumentID}
                    onChange={this.onChangeVedlegg}>
                    <option key={hoveddokumentID} value={hoveddokumentID}>{hoveddokumentTittel}</option>
                    {vedlegg.map(elem => <option key={elem.dokumentID} value={elem.dokumentID}>{elem.tittel}</option>)}
                  </Nav.Select>
                </Nav.Panel>
              }
              {this.velgDokumentID() && <Nav.Panel><PDFDokument journalpostID={journalpostID} dokumentID={this.velgDokumentID()} /></Nav.Panel>}
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

Journalforing.propTypes = {
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  hentJournalOppgave: PT.func.isRequired,
  hentFagsakListe: PT.func.isRequired,
  tilordneSak: PT.func.isRequired,
  opprettNySak: PT.func.isRequired,
  settFeltInnhold: PT.func.isRequired,
  settFeilFelt: PT.func.isRequired,
  settJournalforingHensikt: PT.func.isRequired,
  journalforing: MPT.Journalforing,
  journalforingSkjemaVerdier: MPT.JournalforingSkjemaVerdier,
  fagsakListe: PT.array,
  sokFnrDnr: PT.func.isRequired,
  sokOrgnr: PT.func.isRequired,
  errors: PT.object.isRequired,
  touch: PT.func.isRequired,
  vedleggsdokumenter: PT.arrayOf(PT.shape({ tittel: PT.string, dokumentID: PT.string })).isRequired,
  tilForsiden: PT.func.isRequired,
  journalforSEDSkjemaIsValid: PT.bool.isRequired,
  journalforSEDSkjemaVerdier: PT.object,
  journalforSEDSkjemaErrors: PT.object.isRequired,
};

Journalforing.defaultProps = {
  journalforing: {},
  fagsakListe: [],
  journalforingSkjemaVerdier: {},
  journalforSEDSkjemaVerdier: {},
};

const mapStateToProps = state => ({
  journalforing: journalforingSelectors.JournalforingAlle(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
  fagsakListe: sokSelectors.FagsakSokSelector(state),
  vedleggsdokumenter: journalforingSelectors.JournalforingVedleggsDokumenter(state),
  errors: getFormSyncErrors(KV.Form.JOURNALFORING)(state),
  journalforSEDSkjemaIsValid: isValid(KV.Form.JOURNALFORING_SED)(state),
  journalforSEDSkjemaVerdier: getFormValues(KV.Form.JOURNALFORING_SED)(state),
  journalforSEDSkjemaErrors: getFormSyncErrors(KV.Form.JOURNALFORING_SED)(state),
});

const mapDispatchToProps = dispatch => ({
  hentJournalOppgave: journalpostID => dispatch(journalforingOperations.hent(journalpostID)),
  hentFagsakListe: fnr => dispatch(sokOperations.sok(fnr)),
  settFeltInnhold: (feltNavn, verdi) => dispatch(autofill(KV.Form.JOURNALFORING, feltNavn, verdi)),
  settFeilFelt: (...feltNavn) => (setSubmitFailed(KV.Form.JOURNALFORING, ...feltNavn)),
  settJournalforingHensikt: journalforingHensikt => dispatch(change(KV.Form.JOURNALFORING, 'journalforingHensikt', journalforingHensikt)),
  opprettNySak: data => Api.Journalforing.opprett(data),
  tilordneSak: data => Api.Journalforing.tilordne(data),
  sokFnrDnr: fnr => dispatch(PersonOperations.hent(fnr)),
  sokOrgnr: orgnr => dispatch(OrganisasjonOperations.hent(orgnr)),
  touch: (formName, ...fields) => dispatch(touch(formName, ...fields)),
});

const kontekster = [
  { navn: 'journalforing', melding: 'Det har oppstått en feil: Kunne ikke hente journalforing.' },
];

const JournalforingWrapper = externalProps => {
  useEffect(() => (
    function cleanup() {
      externalProps.resetJournalforingState();
    }
  ), []);
  const MergeProps = hocProps => <Journalforing {...hocProps} {...externalProps} />;
  const JournalforingMedErrorHandling = withErrorHandling(kontekster, withRouter(connect(mapStateToProps, mapDispatchToProps)(MergeProps)));

  return <JournalforingMedErrorHandling />;
};

JournalforingWrapper.propTypes = {
  resetJournalforingState: PT.func.isRequired,
};

const journalforingWrapperMapDispatchToProps = dispatch => ({
  resetJournalforingState: () => dispatch(journalforingOperations.resetJournalforing()),
});

export default connect(null, journalforingWrapperMapDispatchToProps)(JournalforingWrapper);
