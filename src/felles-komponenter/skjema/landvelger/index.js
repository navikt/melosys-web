import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

import './landvelger.css';

const landTekstFormat = landObjekt => (`${landObjekt.term} (${landObjekt.kode})`);

const ValgtLand = ({ landObjekt, slettLand }) => (
  <div className="landliste__enkeltlinje">
    <div className="landliste__enkeltlinje__navn">{landTekstFormat(landObjekt)}</div><button className="landliste__enkeltlinje__knapp" onClick={() => slettLand(landObjekt.kode)}>-</button>
  </div>
);

ValgtLand.propTypes = {
  landObjekt: PT.object.isRequired,
  slettLand: PT.func.isRequired,
};

class LandVelger extends Component {
  componentWillMount() {
    this.setState({
      valgteLand: [],
      inputVerdi: '',
      inputLandObject: {},
      tilgjengeligeLand: [
        { kode: 'BEL', term: 'Belgia' },
        { kode: 'BGR', term: 'Bulgaria' },
        { kode: 'DNK', term: 'Danmark' },
        { kode: 'EST', term: 'Estland' },
        { kode: 'FIN', term: 'Finland' },
        { kode: 'FRA', term: 'Frankrike' },
        { kode: 'GRC', term: 'Hellas' },
        { kode: 'IRL', term: 'Irland' },
        { kode: 'ISL', term: 'Island' },
        { kode: 'ITA', term: 'Italia' },
        { kode: 'HRV', term: 'Kroatia' },
        { kode: 'CYP', term: 'Kypros' },
        { kode: 'LVA', term: 'Latvia' },
        { kode: 'LIE', term: 'Liechtenstein' },
        { kode: 'LTU', term: 'Litauen' },
        { kode: 'LUX', term: 'Luxembourg' },
        { kode: 'MLT', term: 'Malta' },
        { kode: 'NLD', term: 'Nederland' },
        { kode: 'NOR', term: 'Norge' },
        { kode: 'POL', term: 'Polen' },
        { kode: 'PRT', term: 'Portugal' },
        { kode: 'ROU', term: 'Romania' },
        { kode: 'SVK', term: 'Slovakia' },
        { kode: 'SVN', term: 'Slovenia' },
        { kode: 'ESP', term: 'Spania' },
        { kode: 'GBR', term: 'Storbritannia' },
        { kode: 'SWE', term: 'Sverige' },
        { kode: 'CSK', term: 'Tsjekkoslovakia' },
        { kode: 'DEU', term: 'Tyskland' },
        { kode: 'HUN', term: 'Ungarn' },
        { kode: 'AUT', term: 'Østerrike' },
      ],
    });
  }

  /** Legg til land, enten som en direkte parameter til funksjonen ('land') eller
   * via lokal state.landVelger. Dersom landet allerede er lagt til i state.valgteLand,
   * returner i stillhet.
   *
   * @param e Syntetisk objekt Fra React dersom bruker klikker 'legg-til'-knappen.
   * @param land
   */
  leggTilLandHandler = (landObjekt = null) => {
    const landForTillegg = landObjekt || this.state.tilgjengeligeLand.find(item => this.state.inputVerdi === landTekstFormat(item));
    if (landForTillegg === undefined) { return; }

    if (!this.state.valgteLand.includes(landForTillegg)) {
      this.setState(
        {
          valgteLand: [...this.state.valgteLand, landForTillegg],
          inputVerdi: '',
        }
      );
    }
  }

  /** Sletter et land fra state.valgteLand.
   *
   * @param land String Landet i sin helhet som skal slettes.
   */
  slettLandHandler = landKode => {
    this.setState({ valgteLand: [...this.state.valgteLand.filter(item => item.kode !== landKode)] });
  }

  /** Event handler for håndtering av enter-tasten slik at saksbehandler kan skrive inn deler
   * av land-navnet. Dersom kun én match oppstår (feks 'frank' -> 'Frankrike'), så regnes dette som
   * et ønsket valg og leggTilLand kalles med det ene treffet som parameter.
   * @param e SyntetiskEvent React syntetisk event ved KeyDown.
   */
  inputTastNedHandler = e => {
    if (e.keyCode === 13) {
      const landTreff = this.state.tilgjengeligeLand.filter(item => (
        landTekstFormat(item).toLowerCase().includes(this.state.inputVerdi.toLowerCase()))
      );

      if (landTreff.length === 1) {
        this.leggTilLandHandler(landTreff[0]);
      }
    }
  }

  /** Håndter endringer slik at inntasting oppdateres til lokal state og deretter tilbake til
   * form. (Standard React forms).
   * @param e SyntetiskEvent React syntetisk event ved onChange.
   */
  inputEndringHandler = e => {
    this.setState({ inputVerdi: e.target.value });
  }

  render () {
    const { tilgjengeligeLand, valgteLand } = this.state;

    return (
      <div className="landliste">
        {this.state.valgteLand.map(item => <ValgtLand key={item.kode} landObjekt={item} slettLand={this.slettLandHandler} />)}
        <div className="landliste__enkeltlinje">
          <Nav.Input
            list="land"
            label="Tast inn land"
            bredde="l"
            className="landliste__enkeltlinje__input"
            value={this.state.inputVerdi}
            onChange={this.inputEndringHandler}
            onKeyDown={this.inputTastNedHandler}
          />
          <button
            className="landliste__enkeltlinje__knapp landliste__enkeltlinje__knapp--leggtil"
            onClick={() => this.leggTilLandHandler(null)}>+</button>
          <datalist id="land">
            {tilgjengeligeLand.map(item => (!valgteLand.includes(item) ? <option key={item.kode} value={landTekstFormat(item)} /> : ''))}
          </datalist>
        </div>
      </div>
    );
  }
}

export default LandVelger;
