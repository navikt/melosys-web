import React, { Component } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { Panel } from 'nav-frontend-paneler';

import * as Utils from '../../utils';
import SideDialogDokumenter from './sideDialogDokumenter';
import SideDialogBrevBestilling from './brevBestilling';
import SideDialogSedBestilling from './sedBestilling';
import SideDialogBesvarSed from './sideDialogBesvarSed';

import './sideDialog.css';

const uuid = require('uuid/v4');

export const FaneViser = ({
  navn,
  behandlingID,
  saksnummer,
  brevBestillingRedigerbartIArtikkel13,
  brevBestillingRedigerbart,
}) => {
  switch (navn) {
    case 'dokumenter':
      return <SideDialogDokumenter saksnummer={saksnummer} />;
    case 'brevbestilling':
      return <SideDialogBrevBestilling
        behandlingID={behandlingID}
        redigerbart={brevBestillingRedigerbart}
        brevBestillingRedigerbartIArtikkel13={brevBestillingRedigerbartIArtikkel13}
      />;
    case 'sedbestilling':
      return <SideDialogSedBestilling behandlingID={behandlingID} />;
    case 'besvarsed':
      return <SideDialogBesvarSed behandlingID={behandlingID} />;
    default:
      throw new Error('Navn er en påkrevd prop');
  }
};

FaneViser.propTypes = {
  navn: PT.string,
  behandlingID: PT.number.isRequired,
  saksnummer: PT.string.isRequired,
  brevBestillingRedigerbartIArtikkel13: PT.bool.isRequired,
  brevBestillingRedigerbart: PT.bool.isRequired,
};

FaneViser.defaultProps = {
  navn: '',
};

class SideDialog extends Component {
  static propTypes = {
    faner: PT.array,
    saksnummer: PT.string.isRequired,
    behandlingID: PT.number.isRequired,
    brevBestillingRedigerbart: PT.bool.isRequired,
    brevBestillingRedigerbartIArtikkel13: PT.bool.isRequired,
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
          this.leggTilFane({ navn: 'sedbestilling', tittel: 'Opprett ny BUC' });
          this.leggTilFane({ navn: 'besvarsed', tittel: 'SED-utveksling' });
        }
      });
  }

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
    const {
      behandlingID,
      saksnummer,
      brevBestillingRedigerbart,
      brevBestillingRedigerbartIArtikkel13,
    } = this.props;

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
            <FaneViser
              navn={navn}
              behandlingID={behandlingID}
              saksnummer={saksnummer}
              brevBestillingRedigerbartIArtikkel13={brevBestillingRedigerbartIArtikkel13}
              brevBestillingRedigerbart={brevBestillingRedigerbart}
            />
          </div>
        </Panel>
      </div>
    );
  }
}
export default SideDialog;
