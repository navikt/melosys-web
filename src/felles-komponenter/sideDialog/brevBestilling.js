import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, reset, setSubmitFailed } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';
import * as Skjema from '../../felles-komponenter/skjema';
import { formSelectors } from '../../ducks/form/';

// import * as Validering from '../skjema/validering';
import { brevbestillingValidering, erSkjemaGyldig } from '../skjema/validering/brevbestilling';
import { dokumenterOperations, dokumenterSelectors } from '../../ducks/dokumenter';
import * as fagsakSelectors from '../../ducks/fagsaker/selectors';

import './brevBestilling.css';
import * as Utils from '../../utils/utils';

const InfoPanel = () => (
  <Nav.Lesmerpanel
    intro="Se hva som skal stå i mangelbrevet:"
    apneTekst="Klikk her for tips"
    lukkTekst="Lukk"
  >
    <p>
      En beskrivelse av hvilken informasjon eller dokumentasjon som mangler for å gjøre søknaden komplett.
      Din tekst starter etter teksten &laquo;Dette må du sende oss:&raquo;.
    </p>
    <p>
      Brevet inneholder allerede en innleding, beskrivelse av hvordan informasjon sendes inn og en avsluttende tekst.
      Trykk på &laquo;forhåndsvis brev&raquo; for å se brevet når du er fgerdig med å skrive.<br />
      OBS! Det er ikke automatisk stavekontroll, så sjekk teksten to har skrevet.
    </p>
  </Nav.Lesmerpanel>
);

class BrevBestilling extends Component {
  state = { erBrevSendt: false };

  overstyrSubmit = event => {
    event.preventDefault();
  };

  erMangelBrevMedFritekst = () => {
    const { brevbestillingSkjemaVerdier } = this.props;
    if (!brevbestillingSkjemaVerdier) return false;
    return brevbestillingSkjemaVerdier.dokumenttypeKode === 'MELDING_MANGLENDE_OPPLYSNINGER';
  };

  sendBrev = async () => {
    const {
      brevbestillingSkjemaVerdier, opprettDokument, oppsummering, settFeilFelt,
    } = this.props;
    const { behandlingID } = oppsummering;
    const { fritekst, mottaker, dokumenttypeKode } = brevbestillingSkjemaVerdier;
    const dokument = this.erMangelBrevMedFritekst() ? Object.assign({ fritekst, mottaker }) : {};

    if (!erSkjemaGyldig(brevbestillingSkjemaVerdier)) {
      settFeilFelt('mottaker', 'dokumenttypeKode', 'fritekst');
      return false;
    }

    const dokumentResponse = await opprettDokument(behandlingID, dokumenttypeKode, dokument);

    if (dokumentResponse) {
      this.setState({ erBrevSendt: true });
      this.props.resetBrevBestillingForm();
      await Utils.delay(6000);
      this.props.resetDokument();
      this.setState({ erBrevSendt: false });
    }

    return true;
  };

  utkastBrev = async () => {
    const {
      brevbestillingSkjemaVerdier, lagPdfUtkast, oppsummering, settFeilFelt,
    } = this.props;
    const { behandlingID } = oppsummering;
    const { fritekst, mottaker, dokumenttypeKode } = brevbestillingSkjemaVerdier;
    const dokument = this.erMangelBrevMedFritekst() ? Object.assign({ fritekst, mottaker }) : {};

    if (!erSkjemaGyldig(brevbestillingSkjemaVerdier)) {
      settFeilFelt('mottaker', 'dokumenttypeKode', 'fritekst');
      return false;
    }

    const extededResponse = await lagPdfUtkast(behandlingID, dokumenttypeKode, dokument);

    if (extededResponse.data.ok) {
      const { data: response } = extededResponse;
      const arrayBuffer = await response.arrayBuffer();
      const file = new Blob([arrayBuffer], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    } else if (extededResponse.data.error) {
      /*
      const { error, message, path, timestamp } = extededResponse.data;
      this.setState({ feil: { error, message, path, timestamp } });
      */
    }
    return true;
  };

  forkastBrev = () => {
    const { resetBrevBestillingForm, resetDokument } = this.props;
    resetBrevBestillingForm();
    resetDokument();
  };

  render () {
    const { dokumenttyper, aktoerroller, dokumenter } = this.props;
    const { response = {} } = dokumenter;

    const placeholder = 'Feks: "Opplysning om antall utsendet i perioden, "Opplysninger om den ansatt erstatter en annen utsendt ansatt""';
    return (
      <div className="brevBestilling">
        <form onSubmit={this.overstyrSubmit}>
          <Nav.Fieldset legend="Nytt brev">
            <Skjema.Select feltNavn="mottaker" bredde="fullbredde" label="Mottaker">
              {aktoerroller && aktoerroller.map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)}
            </Skjema.Select>
            <Skjema.Select feltNavn="dokumenttypeKode" bredde="fullbredde" label="Type brev" disabled>
              {dokumenttyper && dokumenttyper.map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)}
            </Skjema.Select>
            {this.erMangelBrevMedFritekst() && <InfoPanel />}
            {this.erMangelBrevMedFritekst() &&
            <Skjema.Textarea feltNavn="fritekst" label="Hva skal søker sende inn?" maxLength={200} placeholder={placeholder} visTellerFra={100} feil={undefined} />}
            <div><button onClick={this.utkastBrev} className="brevBestilling__utkastknapp">Vis utkast</button></div>
            <Nav.Knapp htmlType="reset" type="standard" onClick={this.forkastBrev}>Forkast Brev</Nav.Knapp>&nbsp;
            <Nav.Hovedknapp htmlType="submit" onClick={this.sendBrev}>Send brev</Nav.Hovedknapp>
            { this.state.erBrevSendt && <Nav.AlertStripe type="suksess" className="varsel">Brevet er sendt. Det kan ta noe tid før brevet vises i dokumentlisten.</Nav.AlertStripe> }
            { response.ok === false && <Nav.AlertStripe type="advarsel" className="varsel">Kunne ikke sende brev.</Nav.AlertStripe> }
          </Nav.Fieldset>
        </form>
      </div>
    );
  }
}

BrevBestilling.propTypes = {
  resetBrevBestillingForm: PT.func.isRequired,
  opprettDokument: PT.func.isRequired,
  lagPdfUtkast: PT.func.isRequired,
  resetDokument: PT.func.isRequired,
  aktoerroller: PT.arrayOf(MPT.Kodeverk),
  dokumenttyper: PT.arrayOf(MPT.Kodeverk),
  brevbestillingSkjemaVerdier: PT.object,
  dokumenter: PT.object,
  oppsummering: MPT.Oppsummering,
};
BrevBestilling.defaultProps = {
  brevbestillingSkjemaVerdier: {},
  dokumenter: {},
  aktoerroller: [],
  dokumenttyper: [],
  oppsummering: {},
};

const form = {
  form: 'brevbestilling',
  enableReinitialize: true,
  destroyOnUnmount: false,
  updateUnregisteredFields: true,
  validate: brevbestillingValidering,
  onSubmit: () => {},
};

const mapStateToProps = state => ({
  brevbestillingSkjemaVerdier: formSelectors.BrevBestillingFormSelector(state).values,
  dokumenter: dokumenterSelectors.dokumenterSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  dokumenttyper: state.kodeverk.data.dokumenttyper,
  aktoerroller: state.kodeverk.data.aktoerroller,
  initialValues: {
    dokumenttypeKode: 'MELDING_MANGLENDE_OPPLYSNINGER',
    mottaker: 'BRUKER',
    fritekst: undefined,
  },
});

const mapDispatchToProps = dispatch => ({
  settFeilFelt: (...feltNavn) => dispatch(setSubmitFailed('brevbestilling', ...feltNavn)),
  resetBrevBestillingForm: () => dispatch(reset('brevbestilling')),
  resetDokument: () => dispatch(dokumenterOperations.resetDokument()),
  opprettDokument: (behandlingID, dokumenttypeKode, dokument) => dispatch(dokumenterOperations.opprettDokument(behandlingID, dokumenttypeKode, dokument)),
  lagPdfUtkast: (behandlingID, dokumenttypeKode, dokument) => dispatch(dokumenterOperations.lagPdfUtkast(behandlingID, dokumenttypeKode, dokument)),
});

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(BrevBestilling));
