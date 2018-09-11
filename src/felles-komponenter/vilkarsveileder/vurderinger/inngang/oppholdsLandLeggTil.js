import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import LandVelger from '../../../skjema/landvelger';

import { kodeverkObjektTilKode } from '../../../../utils/kodeverk';
import { landTekstFormat } from '../../../skjema/landvelger';

const LeggTilWrapper = ({ bekreftLeggTil, feltNavn, avbryt }) => (
  <div className="leggtilland__linje">
    <LandVelger
      feltNavn={feltNavn}
      bredde="M"
      label="Legg til land"
      leggTilCallback={bekreftLeggTil}
    />
    <div className="leggtilland__linje__knapper">
      <Nav.Knapp mini onClick={bekreftLeggTil}>Legg til</Nav.Knapp>
      <Nav.Knapp mini onClick={avbryt}>Avbryt</Nav.Knapp>
    </div>
  </div>
);

class OppholdsLandLeggTil extends Component {
  state = { erLeggTilIntensjon: false };

  settLeggTilIntensjon = () => this.setState({ erLeggTilIntensjon: true });
  bekreftLeggTil = event => console.log(event.currentTarget)

  avbryt = () => this.setState({ erLeggTilIntensjon: false });

  render () {
    const {
      landKodeObjekt, bekreftFjern, landkoder, oppholdBegrunnelser,
    } = this.props;
    const { erLeggTilIntensjon } = this.state;
    const { settLeggTilIntensjon, avbryt, bekreftLeggTil } = this;

    return (
      <div>
        <div>
          <div>{!erLeggTilIntensjon && <Nav.Knapp mini onClick={settLeggTilIntensjon}>+ Legg til land</Nav.Knapp> }</div>
          {erLeggTilIntensjon && <LeggTilWrapper bekreftLeggTil={bekreftLeggTil} avbryt={avbryt} />}
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
};

export default OppholdsLandLeggTil;
