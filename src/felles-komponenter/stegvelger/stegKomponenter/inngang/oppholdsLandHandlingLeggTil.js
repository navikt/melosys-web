/* eslint react/no-multi-comp:off */
import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

import EnkeltLandPure from '../../../skjema/landvelger/enkeltLandPure';

import { kodeverkObjektTilKode } from '../../../../utils/kodeverk';
import { landTekstFormat } from '../../../skjema/landvelger';

class LeggTilWrapper extends Component {
  state = {
    landKode: '',
    begrunnelseKode: '0',
  };

  oppdaterBegrunnelse = event => {
    const begrunnelseKode = event.target.value;
    this.setState({ begrunnelseKode });
  };

  oppdaterLand = landKode => (this.setState({ landKode }));

  render () {
    const { landKode, begrunnelseKode } = this.state;
    const { oppdaterBegrunnelse, oppdaterLand } = this;
    const {
      bekreft, avbryt, alleLandKoder, oppholdBegrunnelser,
    } = this.props;

    const erInputGyldig = (landKode && begrunnelseKode && begrunnelseKode !== '0');

    return (
      <div className="leggtilland__linje">
        <div className="linje__land">
          <EnkeltLandPure
            bredde="fullbredde"
            label="Velg land:"
            meta={{ error: undefined }}
            onChange={oppdaterLand}
            value={landKode}
            landkoder={alleLandKoder}
            className="linje__nedtrekksvelger"
          />
        </div>
        <div className="linje__begrunnelse">
          <Nav.Select bredde="fullbredde" value={begrunnelseKode} onChange={oppdaterBegrunnelse} label="Velg begrunnelse:" className="linje__nedtrekksvelger">
            <option disabled value="0" />
            {oppholdBegrunnelser.map(enkelt => <option key={enkelt.kode} value={enkelt.kode}>{enkelt.term}</option>)}
          </Nav.Select>
        </div>
        <div className="linje__knapper">
          <Nav.Knapp onClick={avbryt}>Avbryt</Nav.Knapp>
          <Nav.Knapp onClick={() => bekreft(landKode, begrunnelseKode)} disabled={!erInputGyldig}>Legg til</Nav.Knapp>
        </div>
      </div>
    );
  }
}

LeggTilWrapper.propTypes = {
  avbryt: PT.func.isRequired,
  bekreft: PT.func.isRequired,
  alleLandKoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppholdBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
};

class OppholdsLandLeggTil extends Component {
  state = { erLeggTilIntensjon: false };

  settLeggTilIntensjon = () => this.setState({ erLeggTilIntensjon: true });

  bekreftLeggTil = (landKode, begrunnelseKode) => {
    this.props.bekreftLeggTil(landKode, begrunnelseKode);
    this.lukk();
  };

  lukk = () => this.setState({ erLeggTilIntensjon: false });

  render () {
    const { alleLandKoder, oppholdBegrunnelser } = this.props;
    const { erLeggTilIntensjon } = this.state;
    const {
      settLeggTilIntensjon, lukk, bekreftLeggTil,
    } = this;

    return (
      <div>
        <div>
          {!erLeggTilIntensjon && (
            <Nav.Knapp onClick={settLeggTilIntensjon} className="knappMedIkon">
              <Nav.Ikoner kind="tilsette" /><div>Legg til nytt land</div>
            </Nav.Knapp>
          )}

          {erLeggTilIntensjon && (
            <LeggTilWrapper
              alleLandKoder={alleLandKoder}
              oppholdBegrunnelser={oppholdBegrunnelser}
              bekreft={bekreftLeggTil}
              avbryt={lukk}
            />
          )}
        </div>
        <div className="oppholdsland__dataliste">
          <datalist id="alleLand">
            {alleLandKoder.map(item => (<option key={kodeverkObjektTilKode(item)} value={landTekstFormat(item)} />))}
          </datalist>
        </div>
      </div>
    );
  }
}

OppholdsLandLeggTil.propTypes = {
  bekreftLeggTil: PT.func.isRequired,
  alleLandKoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppholdBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default OppholdsLandLeggTil;
