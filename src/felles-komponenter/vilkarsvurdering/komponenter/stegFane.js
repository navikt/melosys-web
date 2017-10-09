import React, { Component} from 'react';
import PT from 'prop-types';

import { connect } from 'react-redux';
import { Knapp } from 'nav-frontend-knapper';
import './stegFane.css';

class StegFane extends Component {
  static propTypes = {
    visNesteKnapp: PT.bool,
    children: PT.any.isRequired,
  }

  static defaultProps = {
    visNesteKnapp: false,
  }

  render() {
    const { visNesteKnapp, children } = this.props;
    const knapp = visNesteKnapp ? <Knapp type="hoved" className="fane__nesteknapp">Bekreft og fortsett</Knapp> : '';

    return (
      <div className="stegVelger__fane">
        {children}
        {knapp}

      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegFane);
