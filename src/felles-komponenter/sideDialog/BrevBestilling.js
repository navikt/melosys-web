import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, reset } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';
import * as Skjema from '../../felles-komponenter/skjema';
import { formSelectors } from '../../ducks/form/';

import PanelHeader from '../../felles-komponenter/panelHeader/panelHeader';
import * as Ikoner from '../../resources/images';
// import * as Validering from '../skjema/validering';
import { brevbestillingValidering } from '../skjema/validering/brevbestilling';
import { dokumenterOperations, dokumenterSelectors } from '../../ducks/dokumenter';
import * as fagsakSelectors from '../../ducks/fagsaker/selectors';

const InfoPanel = () => {
  const panelIkon = Ikoner.Varsel;
  return (
    <Nav.EkspanderbartpanelBase
      heading={<PanelHeader ikon={panelIkon} tittel="Dette skal stå i mangelbrevet" undertittel="" />}
      ariaTittel="Dette skal stå i mangelbrevet">
      <p>
        En beskrivelse av hvilken informasjon eller dokumentasjon som mangler for å gjøre søknaden komplett.
        Din tekst starter etter teksten &laquo;Dette må du sende oss:&raquo;.
      </p>
      <p>
        Brevet inneholder allerede en innleding, beskrivelse av hvordan informasjon sendes inn og en avsluttende tekst.
        Trykk på &laquo;forhåndsvis brev&raquo; for å se brevet når du er fgerdig med å skrive.<br />
        OBS! Det er ikke automatisk stavekontroll, så sjekk teksten to har skrevet.
      </p>
    </Nav.EkspanderbartpanelBase>
  );
};

class BrevBestilling extends Component {
  erMangelBrevMedFritekst = () => {
    const { brevbestillingSkjemaVerdier } = this.props;
    if (!brevbestillingSkjemaVerdier) return false;
    return brevbestillingSkjemaVerdier.dokumenttypeKode === 'MELDING_MANGLENDE_OPPLYSNINGER';
  };
  /*
  sendBrev = async () => {
    const { brevbestillingSkjemaVerdier, opprettDokument, oppsummering } = this.props;
    const { behandlingID } = oppsummering;
    const { fritekst, mottaker, dokumenttypeKode } = brevbestillingSkjemaVerdier;
    const dokument = this.erMangelBrevMedFritekst() ? Object.assign({ fritekst, mottaker }) : {};
    const extededResponse = await opprettDokument(behandlingID, dokumenttypeKode, dokument);
  };
*/
  utkastBrev = async () => {
    const { brevbestillingSkjemaVerdier, lagPdfUtkast, oppsummering } = this.props;
    const { behandlingID } = oppsummering;
    const { fritekst, mottaker, dokumenttypeKode } = brevbestillingSkjemaVerdier;
    const dokument = this.erMangelBrevMedFritekst() ? Object.assign({ fritekst, mottaker }) : {};

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
  };

  forkastBrev = () => {
    const { resetBrevBestillingForm, resetDokument } = this.props;
    resetBrevBestillingForm();
    resetDokument();
  };

  render () {
    const { dokumenttyper, aktoerroller } = this.props;
    const placeholder = 'Feks: "Opplysning om antall utsendet i perioden, "Opplysninger om den ansatt erstatter en annen utsendt ansatt""';
    // const feilmelding = {feilmelding: 'Her er det noe feil.'};
    return (
      <Nav.Panel>
        <Nav.Fieldset legend="Nytt brev">
          <Nav.Row>
            <Skjema.Select feltNavn="mottaker" bredde="fullbredde" label="Mottaker">
              {aktoerroller && aktoerroller.map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)}
            </Skjema.Select>
            <Skjema.Select feltNavn="dokumenttypeKode" bredde="fullbredde" label="Type brev" disabled>
              {dokumenttyper && dokumenttyper.map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)}
            </Skjema.Select>
          </Nav.Row>
          <Nav.Row>
            {this.erMangelBrevMedFritekst() && <InfoPanel /> }
          </Nav.Row>
          <Nav.Row>
            {this.erMangelBrevMedFritekst() && <Skjema.Textarea feltNavn="fritekst" label="Hva skal søker sende inn?" maxLength={200} placeholder={placeholder} visTellerFra={100} feil={undefined} />}
          </Nav.Row>
          {/* {this.state.feil && <Nav.Row><p>{this.state.feil.message}</p></Nav.Row>} */}
          <Nav.Row>
            <Nav.Column xs="12" md="6">
              <Nav.Knapp htmlType="reset" type="standard" onClick={this.forkastBrev}>Forkast Brev</Nav.Knapp>
            </Nav.Column>
            <Nav.Column xs="12" md="6">
              <Nav.Knapp htmlType="submit" type="hoved" onClick={this.utkastBrev}>Send Utkast</Nav.Knapp>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      </Nav.Panel>
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

const BrevBestillingForm = reduxForm({
  form: 'brevbestilling',
  enableReinitialize: true,
  destroyOnUnmount: false,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: brevbestillingValidering,
})(BrevBestilling);

const mapStateToProps = state => ({
  brevbestillingSkjemaVerdier: formSelectors.BrevBestillingFormSelector(state).values,
  dokumenter: dokumenterSelectors.dokumenterSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  dokumenttyper: state.kodeverk.data.dokumenttyper,
  aktoerroller: state.kodeverk.data.aktoerroller,
  initialValues: {
    dokumenttypeKode: 'MELDING_MANGLENDE_OPPLYSNINGER',
    mottaker: 'BRUKER',
  },
});

const mapDispatchToProps = dispatch => ({
  resetBrevBestillingForm: () => dispatch(reset('brevbestilling')),
  resetDokument: () => dispatch(dokumenterOperations.resetDokument()),
  opprettDokument: (behandlingID, dokumenttypeKode, dokument) => dispatch(dokumenterOperations.opprettDokument(behandlingID, dokumenttypeKode, dokument)),
  lagPdfUtkast: (behandlingID, dokumenttypeKode, dokument) => dispatch(dokumenterOperations.lagPdfUtkast(behandlingID, dokumenttypeKode, dokument)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BrevBestillingForm);
