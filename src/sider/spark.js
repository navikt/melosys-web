/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { health } from '../services/api';

import { soknadOperations } from '../ducks/soknad/';
import { fagsakOperations } from '../ducks/fagsaker/';

class Spark extends Component {
  constructor(props) {
    super(props);
  }
  static defaultProps = {
    nyfagsak: undefined,
  };
  componentWillMount() {
  }

  soknadSubmit = event => {
    event.preventDefault();
    const bid = event.target.behandlingID.value;
    const soknad = JSON.parse(event.target.soknadBody.value);
    this.props.sendSoknad(bid, soknad);
  }

  opprettNyFagsakSubmit = event => {
    event.preventDefault();
    const fnr = event.target.fnr.value;
    this.props.opprettNyFagsak(fnr);
  }

  render() {
    const { nyfagsak } = this.props;
    return (
      <div>
        <h1>Health</h1>

        <button onClick={() => console.log(health())} >sjekk health</button>
        <h1>Opprett sak</h1>
        <form onSubmit={this.opprettNyFagsakSubmit}>
          <input type="text" name="fnr" /><br />
          <input type="submit" value="Send" />
        </form>
        <p>{nyfagsak.saksnummer && JSON.stringify(nyfagsak)}</p>

        <h1>Populere søknad manuelt</h1>
        <form onSubmit={this.soknadSubmit}>
          <label>behandlingID:</label><br />
          <input type="text" name="behandlingID" /><br />
          <label>json:</label><br />
          <textarea name="soknadBody" cols="150" rows="20" /><br />
          <input type="submit" value="Send" />
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  nyfagsak: state.fagsaker.data,
});

const mapDispatchToProps = dispatch => ({
  sendSoknad: (bid, soknad) => dispatch(soknadOperations.sendSoknad(bid, soknad)),
  opprettNyFagsak: fnr => dispatch(fagsakOperations.opprettNyFagsak(fnr)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Spark));
