import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';

import { oppgaverOperations } from '../../ducks/oppgaver/';
import * as Kodeverk from '../../ducks/kodeverk';

import { kodeverkObjektTilTerm, kodeverkObjektTilKode } from '../../utils/kodeverk';

import './behandling.css';

const uuid = require('uuid/v4');

const BEHANDLINGSFORM = 'behandlingsform';

class Behandling extends Component {
  componentDidUpdate() {
    const { formValues } = this.props;
    localStorage.setItem(BEHANDLINGSFORM, JSON.stringify(formValues));
  }

  submitOgVideresend = async form => {
    const { handleSubmit, history } = this.props;
    const redirectURL = await handleSubmit(form);

    /* eslint-disable no-alert */
    if (!redirectURL) { return alert('Ingen oppgaver finnes. Videre funksjonalitet ikke implementert.'); }
    /* eslint-enable */
    history.push(redirectURL);
    return true;
  };

  render() {
    const { saksTyper, behandlingsTyper } = this.props;
    return (
      <Nav.Panel className="forside__sidepanel sidepanel__behandling">
        <Nav.Systemtittel>Behandle sak</Nav.Systemtittel>
        <p>Du kan oppgi sakstype og behandlingstype for å få tildelt en sak som du ønsker å behandle.</p>
        <form className="behandling__skjema" onSubmit={this.submitOgVideresend}>
          <Nav.Row>
            <Nav.Column xs="4">
              <Nav.Fieldset legend="Sakstype">
                {saksTyper.map(enkeltType => {
                  const isDisabled = kodeverkObjektTilKode(enkeltType) !== 'EU_EOS';
                  return (<Skjema.Checkbox key={uuid()} label={kodeverkObjektTilTerm(enkeltType)} disabled={isDisabled} feltNavn={`sakstyper.${kodeverkObjektTilKode(enkeltType)}`} />);
                })}
              </Nav.Fieldset>
            </Nav.Column>

            <Nav.Column xs="8">
              <Nav.Fieldset legend="Behandlingstype">
                {behandlingsTyper.map(type => {
                  const isDisabled = kodeverkObjektTilKode(type) !== 'SOEKNAD';
                  return (<Skjema.Checkbox key={uuid()} label={kodeverkObjektTilTerm(type)} disabled={isDisabled} feltNavn={`behandlingstyper.${kodeverkObjektTilKode(type)}`} />);
                })}
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>

          <Nav.Knapp className="behandling__knapp">Behandle sak</Nav.Knapp>
        </form>
      </Nav.Panel>
    );
  }
}

Behandling.propTypes = {
  handleSubmit: PT.func.isRequired,
  history: PT.object.isRequired,
  behandlingsTyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  saksTyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  formValues: PT.object,
};

Behandling.defaultProps = {
  formValues: {},
};

const mapStateToProps = state => ({
  behandlingsTyper: Kodeverk.KodeverkSelectors.behandlingsTyperSelector(state),
  saksTyper: Kodeverk.KodeverkSelectors.sakstyperSelector(state),
  formValues: getFormValues(BEHANDLINGSFORM)(state),
  initialValues: JSON.parse(localStorage.getItem(BEHANDLINGSFORM)),
});
const BehandlngForm = reduxForm({
  form: BEHANDLINGSFORM,
  onSubmit: checkboxliste => oppgaverOperations.sendBehandlingsOppgave(checkboxliste),
})(Behandling);

export default withRouter(connect(mapStateToProps, null)(BehandlngForm));
