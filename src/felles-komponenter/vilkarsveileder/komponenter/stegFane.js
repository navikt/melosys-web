import React, { Component } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import { connect } from 'react-redux';
import { Panel } from 'nav-frontend-paneler';
import './stegFane.css';

class StegFane extends Component {
  static propTypes = {
    children: PT.any.isRequired,
    aktivtSteg: PT.number.isRequired,
    stegNummer: PT.number.isRequired,
  }

  static defaultProps = {
    visNesteKnapp: false,
    nesteKnappKlikk: () => { throw new Error('INGEN_EVENT_KOBLET'); },
    ikoner: {},
  }

  render() {
    const { children, stegNummer } = this.props;
    const stegFaneKlasse = classnames({ stegFane: true, 'stegFane--aktiv': this.props.aktivtSteg === stegNummer });

    return (
      <Panel className={stegFaneKlasse}>
        {children}
      </Panel>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegFane);
