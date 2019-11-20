import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

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

  gyldigeBehandlingstyper = [
    MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
    MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE,
    MKV.Koder.behandlinger.behandlingstyper.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
    MKV.Koder.behandlinger.behandlingstyper.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
    MKV.Koder.behandlinger.behandlingstyper.UTL_MYND_UTPEKT_SEG_SELV,
    MKV.Koder.behandlinger.behandlingstyper.ANMODNING_OM_UNNTAK_HOVEDREGEL,
    MKV.Koder.behandlinger.behandlingstyper.VURDER_TRYGDETID,
    MKV.Koder.behandlinger.behandlingstyper.ØVRIGE_SED,
  ];

  render() {
    return (
      <Nav.Panel className="forside__sidepanel sidepanel__behandling">
        <Nav.typo.Systemtittel>Behandle sak</Nav.typo.Systemtittel>
        <p>Velg sakstype og behandlingstype for å få tildelt en sak.</p>
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
              <Skjema.Select feltNavn="behandlingstype" bredde="fullbredde" label="Behandlingstype">
                {MKV.KTObjects.behandlinger.behandlingstyper
                  .filter(({ kode }) => this.gyldigeBehandlingstyper.includes(kode))
                  .map(({ kode, term }) => (<option key={kode} value={kode}>{term}</option>))}
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
    behandlingstype: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
  },
});
const BehandlngForm = reduxForm({
  form: KV.Form.BEHANDLINGS_FORM,
  destroyOnUnmount: false,
  onSubmit: form => oppgaverOperations.sendBehandlingsOppgave(form),
})(Behandling);

export default withRouter(connect(mapStateToProps, null)(BehandlngForm));
