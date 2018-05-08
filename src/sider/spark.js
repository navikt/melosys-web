/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { soknadOperations } from '../ducks/soknad/';
import { fagsakOperations } from '../ducks/fagsaker/';
import { oppgaverOperations } from '../ducks/oppgaver';

import * as Api from '../services/api';

import * as Mock from '../debug/mock';

import './spark.css';

class Spark extends Component {
  static defaultProps = {
    nyfagsak: undefined,
  };

  soknadSubmit = event => {
    event.preventDefault();
    const bid = event.target.behandlingID.value;
    const soknad = JSON.parse(event.target.soknadBody.value);
    this.props.sendSoknad(bid, soknad);
  };

  opprettNyFagsakSubmit = event => {
    event.preventDefault();
    const fnr = event.target.fnr.value;
    this.props.opprettNyFagsak(fnr);
  };

  plukkOppgaveSubmit = event => {
    event.preventDefault();
    const oppgaveBody = JSON.parse(event.target.oppgaveBody.value);
    this.props.plukkOppgave(oppgaveBody);
  };

  hentFagsakBasertPaFnr = event => {
    event.preventDefault();
    const { fnr : { value : fnr } } = event.target;
    Api.Journalforing.sokFagsaker(fnr).then(response => {
      const firstHit = response[0] || {};
      const { saksnummer } = firstHit;
      saksnummer && this.props.history.push(`/saksbehandling/${saksnummer}`);
    });
  }

  resetOppgaver = () => {
    Api.Oppgaver.sparkReset().then(() => {
      document.location.href = '/';
    });
  }

  render() {
    const { nyfagsak, oppgave } = this.props;
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

        <div className="spark__gruppe">
          <h1>Plukk Oppgave (Behandling ELLER Journalføring)</h1>
          <p>Behandle sak:<br/><code>{JSON.stringify(Mock.behandlingsOppgave)}</code></p>
          <p>Journalføring:<br/><code>{JSON.stringify(Mock.journalforingOppgave)}</code></p>
          <form onSubmit={this.plukkOppgaveSubmit}>
            <p className="spark__gruppe__forklaring"><span>!</span>Sett inn hele JSON-body i feltet nedenfor for å sende denne til plukk-endpoint.</p>
            <textarea name="oppgaveBody" className="spark__oppgave__body" /><br />
            <input type="submit" value="Send" />
          </form>
          <p>{oppgave.oppgaveID && JSON.stringify(oppgave)}</p>
        </div>

        <div className="spark__gruppe">
          <h1>Vise fagsak basert på fnr</h1>
          <form onSubmit={this.hentFagsakBasertPaFnr}>
            <p>Merk: Denne funksjonen bypasser hele verdikjeden journalføringsoppgave -> behandlingsoppgave -> behandling. Den er derfor kun ment til bruk for å teste visningen av en fagsak.</p>
            <label>Tast inn fnr på testpersonen du vil vise:</label>
            <input type="text" name="fnr" /><br />
            <input type="submit" value="Gå til fagsak" />
          </form>
        </div>

        <div className="spark__gruppe">
          <h1>Opprett sak</h1>
          <p className="spark__gruppe__forklaring"><span>!</span>Tast inn fødselsnummer nedenfor for å opprette en ny sak på denne personen. Fødselsnummer må eksistere i testdata på det miljøet du befinner deg i (T5 / T8)</p>
          <form onSubmit={this.opprettNyFagsakSubmit}>
            <input type="text" name="fnr" /><br />
            <input type="submit" value="Send" />
          </form>
          <p>{nyfagsak.saksnummer && JSON.stringify(nyfagsak)}</p>
        </div>

        <div className="spark__gruppe">
          <h1>Populere søknad manuelt</h1>
          <p className="spark__gruppe__forklaring"><span>!</span>Legg inn hele JSON-objektet for søknaden og tast inn behandlingID for å teste lagring av søknaden og knytte den til en faktisk sak.</p>
          <p>soknad:<br/><code>{JSON.stringify(Mock.soknadDokument)}</code></p>
          <form onSubmit={this.soknadSubmit}>
            <label>behandlingID:</label>
            <input type="text" name="behandlingID" />
            <label>json:</label>
            <textarea name="soknadBody" className="spark__soknad__body" />
            <input type="submit" value="Send" />
          </form>
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
  plukkOppgave: (oppgave) => dispatch(oppgaverOperations.send(oppgave)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Spark));
