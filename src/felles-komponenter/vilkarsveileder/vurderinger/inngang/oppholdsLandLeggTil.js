import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import EnkeltLandPure from '../../../skjema/landvelger/enkeltLandPure';

import { kodeverkObjektTilKode } from '../../../../utils/kodeverk';
import { landTekstFormat } from '../../../skjema/landvelger';

const LeggTilWrapper = ({
  valgtLand, landkoder, oppdaterLand, bekreftLeggTil, avbryt,
}) => (
  <div className="leggtilland__linje">
    <EnkeltLandPure
      bredde="M"
      label="Legg til land"
      meta={{ error: undefined }}
      onChange={oppdaterLand}
      value={valgtLand}
      landkoder={landkoder}
    />
    <div className="leggtilland__linje__knapper">
      <Nav.Knapp mini onClick={bekreftLeggTil}>Legg til</Nav.Knapp>
      <Nav.Knapp mini onClick={avbryt}>Avbryt</Nav.Knapp>
    </div>
  </div>
);

LeggTilWrapper.propTypes = {
  valgtLand: PT.string.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppdaterLand: PT.func.isRequired,
  bekreftLeggTil: PT.func.isRequired,
  avbryt: PT.func.isRequired,
};

class OppholdsLandLeggTil extends Component {
  state = { erLeggTilIntensjon: false, valgtLand: '' };

  settLeggTilIntensjon = () => this.setState({ erLeggTilIntensjon: true });
  bekreftLeggTil = () => {
    this.props.bekreftLeggTil(this.state.valgtLand);
    this.resettAlt();
  };

  resettAlt = () => this.setState({ erLeggTilIntensjon: false, valgtLand: '' });

  avbryt = () => this.setState({ erLeggTilIntensjon: false });

  oppdaterLand = valgtLand => this.setState({ valgtLand });

  render () {
    const { landkoder } = this.props;
    const { erLeggTilIntensjon } = this.state;
    const {
      settLeggTilIntensjon, avbryt, bekreftLeggTil, oppdaterLand,
    } = this;

    return (
      <div>
        <div>
          <div>{!erLeggTilIntensjon && <Nav.Knapp mini onClick={settLeggTilIntensjon}>+ Legg til land</Nav.Knapp> }</div>
          {erLeggTilIntensjon && (
            <LeggTilWrapper
              valgtLand={this.state.valgtLand}
              landkoder={landkoder}
              bekreftLeggTil={bekreftLeggTil}
              oppdaterLand={oppdaterLand}
              avbryt={avbryt} />
          )}
        </div>
        <div className="oppholdsland__dataliste">
          <datalist id="alleLand">
            {landkoder.map(item => (<option key={kodeverkObjektTilKode(item)} value={landTekstFormat(item)} />))}
          </datalist>
        </div>
      </div>
    );
  }
}

OppholdsLandLeggTil.propTypes = {
  bekreftLeggTil: PT.func.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default OppholdsLandLeggTil;
