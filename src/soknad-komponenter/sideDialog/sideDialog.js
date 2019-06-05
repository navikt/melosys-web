import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import PT from 'prop-types';
import { Panel } from 'nav-frontend-paneler';

import * as Utils from './../../utils';
import SideDialogDokumenter from './sideDialogDokumenter';
import SideDialogBrevBestilling from './brevBestilling';
import SideDialogSedBestilling from './sedBestilling';
import SideDialogSedUnderArbeid from './sideDialogSedUnderArbeid';

import './sideDialog.css';

const uuid = require('uuid/v4');

class SideDialog extends Component {
  static propTypes = {
    faner: PT.array,
    behandlingID: PT.number.isRequired,
  };

  static defaultProps = {
    faner: [
      { navn: 'dokumenter', tittel: 'Dokumenter' },
      { navn: 'brevbestilling', tittel: 'Send brev' },
    ],
  };

  // Forvent at minst én fane finnes og sett denne som standard aktiv.
  state = {
    aktivFane: this.props.faner[0].navn,
    faner: this.props.faner,
  };

  componentDidMount() {
    Utils.feature.namespaceToggle('q2', 't8')
      .then(skalVises => {
        if (skalVises) {
          this.leggTilFane({ navn: 'sedbestilling', tittel: 'Send SED' });
          this.leggTilFane({ navn: 'sedunderarbeid', tittel: 'SED under arbeid' });
        }
      });
  }

  getFaneKomponent = (navn, behandlingID) => {
    if (navn === 'dokumenter') {
      return <SideDialogDokumenter key={uuid()} />;
    } else if (navn === 'brevbestilling') {
      return <SideDialogBrevBestilling key={uuid()} behandlingID={behandlingID} />;
    } else if (navn === 'sedbestilling') {
      return <SideDialogSedBestilling key={uuid()} behandlingID={behandlingID} />;
    } else if (navn === 'sedunderarbeid') {
      return <SideDialogSedUnderArbeid key={uuid()} behandlingID={behandlingID} />;
    }
    return <SideDialogDokumenter key={uuid()} />;
  };
  /**  Trigges når brukeren klikker en annen fane (historikk, melding eller dokumenter)
   * slik at riktig komponent under menyen vises. Data fra komponenten slik som navn ligger under
   * props.faner-objektet.
   *
   * @param navn {string} Navnet på komponenten som skal settes til aktiv.
   */
  tilFane = navn => {
    this.setState({ aktivFane: navn });
  };

  leggTilFane = fane => {
    this.setState(prevState => ({ faner: [...prevState.faner, fane] }));
  };

  render() {
    const { behandlingID } = this.props;
    const { navn } = this.state.faner.find(item => item.navn === this.state.aktivFane);
    return (
      <div className="dialog panelSeksjon">
        <Panel>
          <div className="dialog__meny" role="navigation">
            { this.state.faner.map(item => (
              <button
                className={classnames({ meny__element: true, 'meny__element--aktiv': (item.navn === this.state.aktivFane) })}
                key={uuid()}
                onClick={() => this.tilFane(item.navn)}>{item.tittel}
              </button>))}
          </div>
          <div>
            { this.getFaneKomponent(navn, behandlingID)}
          </div>
        </Panel>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideDialog);
