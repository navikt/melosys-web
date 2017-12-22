import React, { Component } from 'react';

import * as Nav from '../../../utils/navFrontend';
import { vaskInputDato } from '../../../utils/dato';

import './datofelt.css';

class DatoFelt extends Component {
  componentWillMount() {
    this.setState({ dato: '' });
  }

  vedEndringHandler = e => {
    this.setState({ dato: e.target.value });
  }

  vedFokusUtHandler = () => {
    if (this.state.dato === '') { this.setState({ datoFeil: null }); return; }
    const vasketDato = vaskInputDato(this.state.dato);

    this.setState({ dato: (vasketDato || this.state.dato) });
    this.setState({ datoFeil: !vasketDato ? { feilmelding: 'Datoen ovenfor er ikke gyldig.' } : null });
  }

  render() {
    return (
      <div className="datofelt">
        <Nav.Input
          bredde="S"
          onBlur={this.vedFokusUtHandler}
          onChange={this.vedEndringHandler}
          value={this.state.dato}
          feil={this.state.datoFeil}
          {...this.props}
        />
      </div>
    );
  }
}


export default DatoFelt;
