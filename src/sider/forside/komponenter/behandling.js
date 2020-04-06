import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import MKV from '../../../melosyskodeverk';

import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../../felleskomponenter/skjema';

import { oppgaverOperations } from '../../../ducks/oppgaver';

import './behandling.css';

class Behandling extends Component {
  submitOgVideresend = async form => {
    const { handleSubmit, history } = this.props;
    const redirectURL = await handleSubmit(form);

    /* eslint-disable no-alert */
    if (!redirectURL) { return alert('Ingen oppgaver finnes'); }
    /* eslint-enable */
    history.push(redirectURL);
    return true;
  };

  render() {
    return (
      <Nav.Panel className="forside__sidepanel sidepanel__behandling">
        <Nav.typo.Systemtittel>Behandle sak</Nav.typo.Systemtittel>
        <p>Velg sakstype og behandlingstema for å få tildelt en sak.</p>
        <form className="behandling__skjema" onSubmit={this.submitOgVideresend}>
          <Nav.Row>
            <Nav.Column xs="4">
              <Skjema.Select feltNavn="sakstype" bredde="fullbredde" label="Sakstype">
                {MKV.KTObjects.sakstyper
                  .filter(({ kode }) => kode === MKV.Koder.sakstyper.EU_EOS)
                  .map(({ kode, term }) => (<option key={kode} value={kode}>{term}</option>))}
              </Skjema.Select>
            </Nav.Column>
            <Nav.Column xs="8">
              <Skjema.Select feltNavn="behandlingstema" bredde="fullbredde" label="Behandlingstema">
                {
                  MKV.KTObjects.behandlinger.behandlingstema
                    .map(({ kode, term }) => (<option key={kode} value={kode}>{term}</option>))
                }
              </Skjema.Select>
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
  formValues: PT.object,
};

Behandling.defaultProps = {
  formValues: {},
};

const mapStateToProps = () => ({
  initialValues: {
    sakstype: MKV.Koder.sakstyper.EU_EOS,
    behandlingstema: MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
  },
});

const BehandlngForm = reduxForm({
  form: KV.Form.BEHANDLINGS_FORM,
  destroyOnUnmount: false,
  onSubmit: form => oppgaverOperations.sendBehandlingsOppgave(form),
})(Behandling);

export default withRouter(connect(mapStateToProps, null)(BehandlngForm));
