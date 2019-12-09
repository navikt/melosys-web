import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import PT from 'prop-types';

import * as Utils from '../../../utils';
import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';
import * as Konstanter from '../../../constants';
import * as Api from '../../../services/api';
import * as Ikoner from '../../../resources/images';
import * as Person from '../../../felleskomponenter/skjema/validering/generisk/person';
import AvsenderVelger from './avsendervelger';
import LenkeListeVelger from './lenkelistevelger';

import { Overskrift } from './overskrift';
import { PersonSelectors } from '../../../ducks/personer';
import { OrganisasjonSelectors } from '../../../ducks/organisasjoner';
import { formSelectors } from '../../../ducks/form';
import { journalforingSelectors } from '../../../ducks/journalforing';

import './informasjon.css';

const dokumenttitler = [
  { term: 'Arbeidsforhold' },
  { term: 'Bekreftelse på medlemskap i folketrygden' },
  { term: 'Inntektsopplysninger' },
  { term: 'Merknad til sak' },
  { term: 'Studiedokumentasjon' },
  { term: 'Søknad om medlemskap' },
  { term: 'Unntak' },
  { term: 'Søknad om A1 - Avklaring av trygdetilhørighet ved yrkesaktivitet innen EØS/Sveits' },
  { term: 'Skjema for arbeidsgiver som sender arbeidstaker eller frilanser på midlertidig oppdrag i EØS/Sveits' },
];

/** Denne komponenten inneholder skjemafelter nødvendig for journalføringen
 * slik som informasjon om bruker, informasjon om dokument etc.
 */
class Informasjon extends Component {
  state = {
    spinner: {},
    hoveddokumentTittel: '',
    vedleggPdfTittler: [],
  };

  async componentDidMount() {
    const { hoveddokument, vedlegg } = this.props;
    await this.oppdaterUndoState('hoveddokumentTittel', hoveddokument.tittel);
    await this.oppdaterUndoState('vedleggPdfTittler', vedlegg.reduce((acc, elem) => { acc.push(elem.tittel); return acc; }, []));
    await this.oppdaterFelter(this.props, true);
  }

  async componentDidUpdate(prevProps) {
    await this.oppdaterFelter(prevProps);
  }

  oppdaterUndoState = async (stateNavn, verdi) => {
    await this.setState({ [stateNavn]: verdi });
  };
  oppdaterFelter = async (props, tvingOppdatering) => {
    const {
      brukerID: gammelBrukerID,
      avsenderID: gammelAvsenderID,
    } = props.journalforingSkjemaVerdier;
    const {
      brukerID = '', avsenderID = '',
    } = this.props.journalforingSkjemaVerdier;
    const { hentOgVisBruker, hentOgVisAvsender } = this.props;

    if ((gammelBrukerID !== brukerID) || tvingOppdatering) {
      await hentOgVisBruker(brukerID);
    }

    if ((gammelAvsenderID !== avsenderID) || tvingOppdatering) {
      await hentOgVisAvsender(avsenderID);
    }
  };

  erGyldigAvsenderID = verdi => (
    verdi.length === Konstanter.ANTALL_TALL_I_ORGNR ||
    verdi.length === Konstanter.ANTALL_TALL_I_DNR || verdi.length === Konstanter.ANTALL_TALL_I_FNR
  );

  kopierBrukerTilAvsender = (
    brukerID = this.props.journalforingSkjemaVerdier.brukerID,
    brukerNavn = this.props.journalforingSkjemaVerdier.brukerNavn
  ) => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold('avsenderID', brukerID);
    settFeltInnhold('avsenderNavn', brukerNavn);
  };

  tomAvsender = () => {
    const { settFeltInnhold } = this.props;
    settFeltInnhold('avsenderID', '');
    settFeltInnhold('avsenderNavn', '');
  };

  sjekkBruker = async verdi => {
    const { tomAvsender, kopierBrukerTilAvsender } = this;
    const { settFeltInnhold, hentOgVisBruker } = this.props;
    const { erBrukerAvsender } = this.props.journalforingSkjemaVerdier;

    if (Person.erGyldigFnr(verdi)) {
      await this.spinner('brukerNavn');
      const response = await hentOgVisBruker(verdi);
      if (!response) return;
      const { brukerID, sammensattNavn } = response;
      if (erBrukerAvsender) { kopierBrukerTilAvsender(brukerID, sammensattNavn); }
    } else {
      settFeltInnhold('brukerNavn', '');
      if (erBrukerAvsender) { tomAvsender(); }
    }
  };

  sjekkAvsender = async verdi => {
    const { erGyldigAvsenderID } = this;
    const { settFeltInnhold, hentOgVisAvsender } = this.props;

    if (erGyldigAvsenderID(verdi)) {
      await this.spinner('avsenderNavn');
      await hentOgVisAvsender(verdi);
    } else {
      await settFeltInnhold('avsenderNavn', '');
    }
  };
  IDFeltTastOppHandler = async event => {
    const { id: opprinneligFeltID, value } = event.target;

    if (opprinneligFeltID === 'brukerID') { await this.sjekkBruker(value); }
    if (opprinneligFeltID === 'avsenderID') { await this.sjekkAvsender(value); }
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
  updateTittel = (feltnavn, verdi) => {
    this.oppdaterUndoState(feltnavn, verdi);
  };
  updateVedleggTittel = async (index, verdi) => {
    const tittler = [...this.state.vedleggPdfTittler];
    tittler[index] = verdi;
    await this.oppdaterUndoState('vedleggPdfTittler', tittler);
  };
  render() {
    const {
      journalpostID,
      dokumentID,
      mottattDato,
      vedlegg,
      settFeltInnhold,
      hentOgVisRepresentant,
      journalforingSkjemaVerdier,
    } = this.props;
    const { hoveddokumentTittel, vedlegg: skjemaVedlegg } = journalforingSkjemaVerdier;
    const {
      spinner: { brukerNavn: visBrukerSpinner },
      spinner: { avsenderNavn: visAvsenderSpinner },
    } = this.state;

    const dokumentURI = (jpostID, dokID) => Api.Dokumenter.pdf.uriPath(jpostID, dokID);
    return (
      <div className="informasjon">
        <Overskrift tekst="Informasjon om bruker" ikon={Ikoner.AccountCircle} className="undertittel oversteUndertittel" />
        <Skjema.Input feltNavn="brukerID" label="Brukers fnr eller dnr:" onKeyUp={this.IDFeltTastOppHandler} />
        <Skjema.Input feltNavn="brukerNavn" label="Brukers navn:" disabled />
        { visBrukerSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }

        <Overskrift tekst="Informasjon om avsender" ikon={Ikoner.Globe} className="undertittel" />
        <AvsenderVelger
          className="avsenderVelger"
          kopierBrukerTilAvsender={this.kopierBrukerTilAvsender}
          tomAvsender={this.tomAvsender}
          settFeltInnhold={settFeltInnhold}
          visAvsenderSpinner={visAvsenderSpinner}
          hentOgVisRepresentant={hentOgVisRepresentant}
        />
        <Overskrift tekst="Dokumenter" ikon={Ikoner.Filenew} className="undertittel oversteUndertittel" />
        <Nav.Input
          label="Mottatt dato"
          type="dato"
          bredde="S"
          disabled
          value={Utils.dato.formatterDatoTilNorsk(mottattDato)}
        />

        <Nav.Fieldset legend="Hoveddokument:">
          <LenkeListeVelger
            feltNavn="hoveddokumentTittel"
            placeholder="(velg eller skriv inn egen tittel)"
            muligeValg={dokumenttitler}
            linkTo={dokumentURI(journalpostID, dokumentID)}
            dokumentTittel={hoveddokumentTittel}
            undoTittel={this.state.hoveddokumentTittel}
            updateTittel={() => this.updateTittel('hoveddokumentTittel', hoveddokumentTittel)}
          />
        </Nav.Fieldset>
        <p>Vedlegg</p>
        {vedlegg.length > 0 && vedlegg.map((elem, index) =>
          <Fragment key={elem.dokumentID}>
            <LenkeListeVelger
              feltNavn={`vedlegg.pdf.tittel_${index}`}
              placeholder="(velg eller skriv inn egen tittel)"
              muligeValg={dokumenttitler}
              linkTo={dokumentURI(journalpostID, dokumentID)}
              dokumentTittel={skjemaVedlegg.pdf[`tittel_${index}`]}
              undoTittel={this.state.vedleggPdfTittler[index]}
              updateTittel={() => this.updateVedleggTittel(index, skjemaVedlegg.pdf[`tittel_${index}`])}
            />
          </Fragment>)
        }
        <Skjema.ListeVelger
          feltNavn="vedlegg.logiskeTitler"
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
  hentOgVisAvsender: PT.func.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
  journalpostID: PT.string,
  dokumentID: PT.string,
  dokumentTittel: PT.string,
  mottattDato: PT.string.isRequired,
  hoveddokument: PT.shape({ dokumentID: PT.string, tittel: PT.string }).isRequired,
  vedlegg: PT.arrayOf(PT.shape({ dokumentID: PT.string, tittel: PT.string })),
  settFeltInnhold: PT.func.isRequired,
};

Informasjon.defaultProps = {
  journalforingSkjemaVerdier: {},
  journalpostID: '',
  dokumentID: '',
  dokumentTittel: null,
  vedlegg: [],
};

const mapStateToProps = state => ({
  person: PersonSelectors.personerSelector(state),
  organisasjon: OrganisasjonSelectors.organisasjonerSelector(state),
  mottattDato: journalforingSelectors.MottattDatoSelector(state),
  hoveddokument: journalforingSelectors.JournalforingHovedDokument(state),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
});

const mapDispatchToProps = dispatch => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change('journalforing', feltNavn, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Informasjon);
