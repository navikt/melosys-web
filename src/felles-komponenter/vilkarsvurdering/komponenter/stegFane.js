import React, { Component } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

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
    aktivtSteg: PT.number.isRequired,
  }

  static defaultProps = {
    visNesteKnapp: false,
    nesteKnappKlikk: () => { throw new Error('INGEN_EVENT_KOBLET'); },
    ikoner: {},
  }

  render() {
    const { visNesteKnapp, children } = this.props;
    const knapp = visNesteKnapp ? <Knapp type="hoved" className="fane__nesteknapp" onClick={this.props.nesteKnappKlikk}>Bekreft og fortsett</Knapp> : '';
    const stegFaneKlasse = classnames('stegVelger__fane', `steg${this.props.aktivtSteg}`);

    return (
      <Panel className={stegFaneKlasse}>
        {children}
        {knapp}
      </Panel>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegFane);
