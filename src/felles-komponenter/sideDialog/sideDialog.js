import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import PT from 'prop-types';
import { Panel } from 'nav-frontend-paneler';

import SideDialogHistorikk from './sideDialogHistorikk';
import SideDialogMelding from './sideDialogMelding';
import SideDialogDokumenter from './sideDialogDokumenter';

// import * as Api from '../../services/api';

import './sideDialog.css';

const uuid = require('uuid/v4');
/*
const body = {
  mottaker: 'ARBEIDSGIVER', // "ARBEIDSGIVER|MOTTAKER",
  fritekst: 'blahbalh',
};
*/
class SideDialog extends Component {
  static propTypes = {
    faner: PT.array,
  };

  static defaultProps = {
    faner: [
      { navn: 'historikk', tittel: 'Historikk', komponent: <SideDialogHistorikk key={uuid()} /> },
      { navn: 'melding', tittel: 'Melding', komponent: <SideDialogMelding key={uuid()} /> },
      { navn: 'dokumenter', tittel: 'Dokumenter', komponent: <SideDialogDokumenter key={uuid()} /> },
    ],
  };

  // Forvent at minst én fane finnes og sett denne som standard aktiv.
  state = {
    aktivFane: this.props.faner[0].navn,
  };
  /*
  async componentDidMount() {
    const abc = await Api.Dokumenter.opprettDokument(4, '000074', body);
    console.dir(abc);
  }
  */
  /**  Trigges når brukeren klikker en annen fane (historikk, melding eller dokumenter)
   * slik at riktig komponent under menyen vises. Data fra komponenten slik som navn ligger under
   * props.faner-objektet.
   *
   * @param navn {string} Navnet på komponenten som skal settes til aktiv.
   */
  tilFane = navn => {
    this.setState({ aktivFane: navn });
  };

  render() {
    return (
      <div className="dialog panelSeksjon">
        <Panel>
          <div className="dialog__meny" role="navigation">
            { this.props.faner.map(item => (
              <button
                className={classnames({ meny__element: true, 'meny__element--aktiv': (item.navn === this.state.aktivFane) })}
                key={uuid()}
                onClick={() => this.tilFane(item.navn)}>{item.tittel}
              </button>))}
          </div>
          <div>
            { this.props.faner.find(item => item.navn === this.state.aktivFane).komponent }
          </div>
        </Panel>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideDialog);
