import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, reset, setSubmitFailed } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../kodeverk';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';
import * as Skjema from '../skjema';
import { formSelectors } from '../../ducks/form/';

import { brevbestillingValidering, erSkjemaGyldig } from '../skjema/validering/brevbestilling';
import { dokumenterOperations, dokumenterSelectors } from '../../ducks/dokumenter';
import { fagsakSelectors } from '../../ducks/fagsaker';
import PdfLenkeListe from '../pdfLenkeListe';

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
    return brevbestillingSkjemaVerdier.dokumenttypeKode === MKV.Koder.brev.produserbaredokumenter.MELDING_MANGLENDE_OPPLYSNINGER;
  };

  sendBrev = async () => {
    const {
      brevbestillingSkjemaVerdier, opprettDokument, oppsummering,
    } = this.props;
    const { behandlingID } = oppsummering;
    const { fritekst, mottaker, dokumenttypeKode } = brevbestillingSkjemaVerdier;
    const dokument = this.erMangelBrevMedFritekst() ? Object.assign({ fritekst, mottaker, begrunnelseKode: null }) : {};

    this.setState({ feilmelding: undefined });

    if (!(await this.validerBrev())) {
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

  validerBrev = async () => {
    const {
      brevbestillingSkjemaVerdier, settFeilFelt,
    } = this.props;

    if (!erSkjemaGyldig(brevbestillingSkjemaVerdier)) {
      settFeilFelt('mottaker', 'dokumenttypeKode', 'fritekst');
      return false;
    }

    return true;
  };

  forkastBrev = async () => {
    const { resetBrevBestillingForm, resetDokument } = this.props;
    resetDokument();
    resetBrevBestillingForm();
    // Quirk: Reset av form oppdaterer tilbake til initValues i form state, men
    // av en eller annen grunn så rendres ikke select til DOM.
    // Quick-fix er å tvinge en update til vi finner ut hva som blocker dette.
    await Utils.delay(0);
    this.forceUpdate();
  };

  render () {
    const {
      brevbestillingSkjemaVerdier,
      oppsummering,
      redigerbart,
    } = this.props;
    const { behandlingID } = oppsummering;
    const { fritekst, mottaker, dokumenttypeKode } = brevbestillingSkjemaVerdier;

    const data = this.erMangelBrevMedFritekst() ? Object.assign({ fritekst, mottaker }) : {};
    const ForhandsvistePdfDokumenter = [
      { navn: 'Vis utkast', type: dokumenttypeKode, data },
    ];

    const placeholder = 'Feks: "Opplysning om antall utsendet i perioden, "Opplysninger om den utsendte fortsetter sitt norske arbeidsforhold""';
    return (
      <div className="brevBestilling">
        <form onSubmit={this.overstyrSubmit}>
          <Nav.Fieldset legend="Nytt brev">
            <Skjema.Select feltNavn="mottaker" bredde="fullbredde" label="Mottaker" disabled={!redigerbart}>
              {MKV.KTObjects.aktoersroller.map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)}
            </Skjema.Select>
            <Skjema.Select feltNavn="dokumenttypeKode" bredde="fullbredde" label="Type brev" disabled>
              {MKV.KTObjects.brev.produserbaredokumenter.map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)}
            </Skjema.Select>
            {this.erMangelBrevMedFritekst() && <InfoPanel />}
            {this.erMangelBrevMedFritekst() &&
            <Skjema.Textarea disabled={!redigerbart} feltNavn="fritekst" label="Hva skal søker sende inn?" maxLength={200} placeholder={placeholder} visTellerFra={100} feil={undefined} />}
            { behandlingID && redigerbart &&
              <PdfLenkeListe behandlingID={behandlingID} dokumenter={ForhandsvistePdfDokumenter} vedKlikk={this.validerBrev} />
            }
            <Nav.Knapp htmlType="reset" type="standard" disabled={!redigerbart} onClick={this.forkastBrev}>Forkast Brev</Nav.Knapp>&nbsp;
            <Nav.Hovedknapp htmlType="submit" disabled={!redigerbart} onClick={this.sendBrev}>Send brev</Nav.Hovedknapp>
            { this.state.erBrevSendt && <Nav.AlertStripe type="suksess" className="varsel">Brevet er sendt. Det kan ta noe tid før brevet vises i dokumentlisten.</Nav.AlertStripe> }
            { this.state.feilmelding && <Nav.AlertStripe type="advarsel" className="varsel">{this.state.feilmelding}</Nav.AlertStripe> }
          </Nav.Fieldset>
        </form>
      </div>
    );
  }
}

BrevBestilling.propTypes = {
  resetBrevBestillingForm: PT.func.isRequired,
  opprettDokument: PT.func.isRequired,
  settFeilFelt: PT.func.isRequired,
  resetDokument: PT.func.isRequired,
  brevbestillingSkjemaVerdier: PT.object,
  dokumenter: PT.object,
  oppsummering: MPT.Oppsummering,
  redigerbart: PT.bool.isRequired,
};
BrevBestilling.defaultProps = {
  brevbestillingSkjemaVerdier: {},
  dokumenter: {},
  oppsummering: {},
};

const form = {
  form: KV.Form.BREV_BESTILLING,
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
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
  initialValues: {
    dokumenttypeKode: MKV.Koder.brev.produserbaredokumenter.MELDING_MANGLENDE_OPPLYSNINGER,
    mottaker: MKV.Koder.representerer.BRUKER,
    fritekst: '',
  },
});

const mapDispatchToProps = dispatch => ({
  settFeilFelt: (...feltNavn) => dispatch(setSubmitFailed(KV.Form.BREV_BESTILLING, ...feltNavn)),
  resetBrevBestillingForm: () => dispatch(reset(KV.Form.BREV_BESTILLING)),
  resetDokument: () => dispatch(dokumenterOperations.resetDokument()),
  opprettDokument: (behandlingID, dokumenttypeKode, data) => dispatch(dokumenterOperations.opprettDokument(behandlingID, dokumenttypeKode, data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm(form)(BrevBestilling));
