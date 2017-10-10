import React, { Component } from 'react';
import PT from 'prop-types';

import { connect } from 'react-redux';
import { Knapp } from 'nav-frontend-knapper';
import { Panel } from 'nav-frontend-paneler';
import './stegFane.css';

class StegFane extends Component {
  static propTypes = {
    visNesteKnapp: PT.bool,
    nesteKnappKlikk: PT.func,
    children: PT.any.isRequired,
    ikoner: PT.object,
  }

  static defaultProps = {
    visNesteKnapp: false,
    nesteKnappKlikk: () => { throw new Error('INGEN_EVENT_KOBLET'); },
    ikoner: {},
  }

  render() {
    const { visNesteKnapp, children } = this.props;
    const knapp = visNesteKnapp ? <Knapp type="hoved" className="fane__nesteknapp" onClick={this.props.nesteKnappKlikk}>Bekreft og fortsett</Knapp> : '';

    return (
      <Panel className="stegVelger__fane">
        {children}
        {knapp}
      </Panel>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegFane);
