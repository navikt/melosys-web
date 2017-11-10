import React, { Component } from 'react';
import * as Nav from '../../../utils/navFrontend';
import vaskInputDato from '../../../utils/dato';

import './datofelt.css';

class DatoFelt extends Component {
  componentWillMount() {
    this.setState({ dato: '' });
  }

  vedEndringHandler = e => {
    this.setState({ dato: e.target.value });
  }

  vedFokusUtHandler = () => {
    this.setState({ dato: vaskInputDato(this.state.dato) });
  }

  render() {
    return (
      <div className="datofelt">
        <Nav.Input label="Opprettet dato" bredde="s" onBlur={this.vedFokusUtHandler} onChange={this.vedEndringHandler} value={this.state.dato} />
      </div>
    );
  }
}


export default DatoFelt;
