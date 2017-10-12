import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import EkspanderbartPanel from 'nav-frontend-ekspanderbartpanel';
import { Knapp } from 'nav-frontend-knapper';
import { Undertittel, Normaltekst } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import { Container, Row, Column } from 'nav-frontend-grid';

import './sideOppsummering.less';

class SideHistorikk extends Component {
  static propTypes = {
    historikk: PT.object,
  };
  static defaultProps = {
    historikk: {

    },
  };

  render() {
    return (
      <div className="tilleggsopplysninger panelSeksjon">
        <Panel className="saksbehandling__soknadSammendrag">
          Historikk
        </Panel>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideHistorikk);
