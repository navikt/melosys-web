import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { KTObject } from 'melosys-kodeverk';
import { RootState } from 'AppTypes';

import MKV from '../../../melosyskodeverk';

import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../../felleskomponenter/skjema';

import { oppgaverOperations } from '../../../ducks/oppgaver';
import { serverinfoSelectors } from '../../../ducks/serverinfo';

import './behandling.css';

const compareTerm = (a: KTObject, b: KTObject) => {
  if (!a.term) return 1;
  if (!b.term) return -1;

  return a.term.localeCompare(b.term);
};

const mapStateToProps = (state: RootState) => ({
  erProdish: serverinfoSelectors.ErProdishSelector(state),
  initialValues: {
    behandlingstema: MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
  },
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type BehandlingProps = PropsFromRedux & RouteComponentProps;

class Behandling extends Component<InjectedFormProps<KV.Form.BehandlingsFormData, BehandlingProps> & BehandlingProps> {
  submitOgVideresend = async (form: any) => {
    const { handleSubmit, history } = this.props;
    const redirectURL = await handleSubmit(form);

    /* eslint-disable no-alert */
    if (!redirectURL) { return alert('Ingen oppgaver finnes'); }
    /* eslint-enable */
    history.push(redirectURL);
    return true;
  };

  render() {
    const { erProdish } = this.props;

    const ikkePlukkbareBehandlingstemaer = erProdish ? [
      MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND,
    ] : [];
    const behandlingstemaErPlukkbart = (behandlingtemaKTObject: KTObject) => !ikkePlukkbareBehandlingstemaer.includes(behandlingtemaKTObject.kode);

    return (
      <Nav.Panel className="forside__sidepanel sidepanel__behandling">
        <Nav.typo.Systemtittel>Behandle sak</Nav.typo.Systemtittel>
        <p>Velg behandlingstema for å få tildelt en sak.</p>
        <form className="behandling__skjema" onSubmit={this.submitOgVideresend}>
          <Nav.Row>
            <Nav.Column xs="8">
              <Skjema.Select feltNavn="behandlingstema" bredde="fullbredde" label="Behandlingstema">
                {
                  MKV.KTObjects.behandlinger.behandlingstema
                    .filter(behandlingstemaErPlukkbart)
                    .sort(compareTerm)
                    .map(({ kode, term }: KTObject) => {
                      const tekst = term;

                      return (
                        <option key={kode} value={kode}>{tekst}</option>
                      );
                    })
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

const BehandlngForm = reduxForm<KV.Form.BehandlingsFormData, BehandlingProps>({
  form: KV.Form.BEHANDLINGS_FORM,
  destroyOnUnmount: false,
  onSubmit: form => oppgaverOperations.sendBehandlingsOppgave(form),
})(Behandling);

export default withRouter(connector(BehandlngForm));
