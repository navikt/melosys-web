/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import { soknadOperations } from '../ducks/soknad/';
import { fagsakOperations } from '../ducks/fagsaker/';
import { oppgaverOperations } from '../ducks/oppgaver';

import {
  JsonTree,
  ADD_DELTA_TYPE,
  REMOVE_DELTA_TYPE,
  UPDATE_DELTA_TYPE,
  DATA_TYPES,
  INPUT_USAGE_TYPES,
} from 'react-editable-json-tree'

import * as Api from '../services/api';

import * as Mock from '../debug/mock';

import './spark.css';

const uuid = require('uuid/v4');

class Spark extends Component {
  static defaultProps = {
    nyfagsak: undefined,
  };

  state = {
    soknad: {
      soeknadDokument: '',
      behandlingID: 0,
    },
    fagsaker: []
  };

  opprettNyFagsakSubmit = event => {
    event.preventDefault();
    const fnr = event.target.fnr.value;
    this.props.opprettNyFagsak(fnr);
  };

  behandlingsOppgaveSubmit = event => {
    event.preventDefault();
    const oppgaveBody = JSON.parse(event.target.oppgaveBody.value);
    this.props.behandlingsOppgave(oppgaveBody);
  };

  jornalforingOppgaveSubmit = event => {
    event.preventDefault();
    const oppgaveBody = JSON.parse(event.target.oppgaveBody.value);
    this.props.journalOppgave(oppgaveBody);
  };

  hentFagsakBasertPaFnr = async event => {
    event.preventDefault();
    const { fnr : { value : fnr } } = event.target;
    const response = await Api.Fagsaker.sok(fnr);
    this.setState({fagsaker: response});
  };

  resetOppgaver = () => {
    Api.Oppgaver.sparkReset().then(() => {
      document.location.href = '/';
    });
  };

  hentFagsakOgSoknad = saksnummer => {
    Api.Fagsaker.hent(saksnummer)
      .then(response => {
        const forsteBehandling = response.behandlinger[0] || {};
        const {behandlingID} = forsteBehandling.oppsummering;
        return Api.Soknader.hent(behandlingID);
      })
      .then(response => {
        const {soeknadDokument = Mock.soeknadDokument, behandlingID} = response;
        const erNySoknad = response.soeknadDokument === undefined;
        this.setState({soknad: {soeknadDokument, behandlingID}, erNySoknad });
      })
      .catch(error => this.setState({soknad: { soeknadDokument: '', behandlingID: '', error } }));
  };

  soknadSubmit = event => {
    event.preventDefault();
    const bid = event.target.behandlingID.value;
    const soknad = JSON.parse(event.target.soknadBody.value);
    Api.Soknader.send(bid, soknad)
      .then(response => {
        if(response.behandlingID){
          this.setState({soknad: {...this.state.soknad}, bleLagret: true});
        }
      })
  };

  updateSoknadJSON = data => {
    this.setState({soknad: {...this.state.soknad, soeknadDokument: data}});
    return true;
  };

  render() {
    const { nyfagsak, oppgave } = this.props;
    const { soknad } = this.state;
    const { erNySoknad } = this.state;

    const { error = {} } = this.state.soknad;
    const { message: feilmelding = ''} = error;

    return (
      <div className="spark">
        <div className="spark__gruppe">
          <h1>Health</h1>
          <button onClick={() => console.log(Api.Health.health())} >sjekk health</button>
        </div>

        <div className="spark__gruppe">
          <h1>Reset mine oppgaver</h1>
          <p>Denne funksjonen legger alle journalføringsoppgaver og behandlingsoppgaver registrert på din innlogged test-bruker tilbake i bingen slik at du kan plukke de på nytt.</p>
          <button onClick={this.resetOppgaver}>reset</button>
        </div>

        { // Send behandlingsoppgave.
        }
        <div className="spark__gruppe">
          <h1>Velg behandlingsoppgave</h1>
          <p>Behandle sak:<br/><code>{JSON.stringify(Mock.behandlingsOppgave)}</code></p>
          <form onSubmit={this.behandlingsOppgaveSubmit}>
            <p className="spark__gruppe__forklaring"><span>!</span>Sett inn hele JSON-body i feltet nedenfor for å sende denne til plukk-endpoint.</p>
            <textarea name="oppgaveBody" className="spark__oppgave__body" /><br />
            <input type="submit" value="Send" />
          </form>
          <p>{oppgave.oppgaveID && JSON.stringify(oppgave)}</p>
        </div>

        { // Send journalføringsoppgave.
        }
        <div className="spark__gruppe">
          <h1>Velg Journalførings oppgave</h1>
          <p>Journalføring:<br/><code>{JSON.stringify(Mock.journalforingOppgave.fagomrade)}</code></p>
          <form onSubmit={this.jornalforingOppgaveSubmit}>
            <p className="spark__gruppe__forklaring"><span>!</span>Sett inn hele JSON-body i feltet nedenfor for å sende denne til plukk-endpoint.</p>
            <textarea name="oppgaveBody" className="spark__oppgave__body" /><br />
            <input type="submit" value="Send" />
          </form>
          <p>{oppgave.oppgaveID && JSON.stringify(oppgave)}</p>
        </div>

        { // Hent fagsak basert på brukers fødselsnummer. Dette trenger vi for å kunne omgå
          // søket på forsiden hvor vi egentlig kun søker etter behandlingsoppgaver - ikke fagsaker.
        }
        <div className="spark__gruppe">
          <h1>Vise fagsak basert på fnr</h1>
          <form onSubmit={this.hentFagsakBasertPaFnr}>
            <p>Merk: Denne funksjonen bypasser hele verdikjeden journalføringsoppgave -> behandlingsoppgave -> behandling. Den er derfor kun ment til bruk for å teste visningen av en fagsak.</p>
            <label>Tast inn fnr på testpersonen du vil vise:</label>
            <input type="text" name="fnr" /><br />
            <div className="spark__resultatliste">
              {this.state.fagsaker.map(fagsak =>
                (<Link key={uuid()} to={`/saksbehandling/${fagsak.saksnummer}`} >Saksnummer {fagsak.saksnummer}</Link>)
              )}
            </div>
            <input type="submit" value="Finn fagsak(er)" />
          </form>
        </div>

        { // Opprette ny sak på person gitt fnr
          //
        }
        <div className="spark__gruppe">
          <h1>Opprett sak</h1>
          <p className="spark__gruppe__forklaring"><span>!</span>Tast inn fødselsnummer nedenfor for å opprette en ny sak på denne personen. Fødselsnummer må eksistere i testdata på det miljøet du befinner deg i (T5 / T8)</p>
          <form onSubmit={this.opprettNyFagsakSubmit}>
            <input type="text" name="fnr" /><br />
            <input type="submit" value="Send" />
          </form>
          <p>{nyfagsak.saksnummer && JSON.stringify(nyfagsak)}</p>
        </div>

        { // Hent søknaden til en bruker basert på fødselsnummer. Brukeren kan ha flere fagsaker, så
          // list ut fagsakene slik at riktig kan velges.
        }
        <div className="spark__gruppe">
          <h1>Populere eller oppdatere søknad</h1>
          <p className="spark__gruppe__forklaring"><span>!</span>Tast inn fødselsnummer først. Dersom behandlingen finnes, men har en ikke-registrert papirsøknad vil en ny søknadstemplate bli brukt.</p>
          <h2>1. Hent eksisterende fagsak(er) via fnr</h2>
          <form onSubmit={this.hentFagsakBasertPaFnr}>
            <label>fnr:</label>
            <input type="text" name="fnr" /><br />
            <div>{feilmelding}</div>
            <input type="submit" value="Hent fagsak" />
          </form>
          {this.state.fagsaker.length > 0 && <div><h2>2. Velg fagsaken som du vil plukke søknad fra eller lage ny søknad til</h2>
          Merk: Kun søknad fra siste behandling på fagsaken du velger blir hentet pr i dag.
          <div className="spark__resultatliste">
            {this.state.fagsaker.map(fagsak =>
              (<button key={uuid()} onClick={() => this.hentFagsakOgSoknad(fagsak.saksnummer)}>Saksnummer {fagsak.saksnummer}</button>)
            )}
          </div>
          <h2>3. Rediger direkte i JSON-treet nedenfor</h2>
          {erNySoknad && <p>Fant ingen eksisterende søknader på dette fødselsnummeret. Søknaden nedenfor er generert utifra en template.</p>}
          {!feilmelding && <JsonTree
            data={this.state.soknad}
            rootName="soknad"
            onFullyUpdate={this.updateSoknadJSON}
            editButtonElement={<button className="knapp__lagre">Lagre</button>}
            cancelButtonElement={<button className="knapp__avbryt">Avbryt</button>}
          />}
          <h2>4. Lagre søknaden</h2>
          <form onSubmit={this.soknadSubmit}>
            <label>behandlingID:</label>
            <input type="text" name="behandlingID" value={this.state.soknad.behandlingID} disabled />
            <label>json:</label>
            <textarea
              name="soknadBody"
              className="spark__soknad__body"
              value={JSON.stringify({...soknad})}
              onChange={() => {}}
            />
            <input type="submit" value="Lagre søknad" />
            {this.state.bleLagret && <div className="spark__bekreftelse">✔ Søknaden er lagret!</div>}
          </form>
          </div>}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  nyfagsak: state.fagsaker.data,
  oppgave: state.oppgaver.data,
});

const mapDispatchToProps = dispatch => ({
  sendSoknad: (bid, soknad) => dispatch(soknadOperations.send(bid, soknad)),
  opprettNyFagsak: fnr => dispatch(fagsakOperations.opprett(fnr)),
  behandlingsOppgave: (oppgave) => oppgaverOperations.sendBehandlingsOppgave(oppgave),
  journalOppgave: (oppgave) => oppgaverOperations.sendJournalOppgave(oppgave),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Spark));
