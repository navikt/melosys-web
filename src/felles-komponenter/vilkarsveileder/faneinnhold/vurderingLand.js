import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import DatoFelt from '../../skjema/datofelt';

import './vurderingLand.css';

const ValgtLand = ({ land, slettLand }) => (
  <div className="landliste__enkeltlinje">
    <div className="landliste__enkeltlinje__navn">{land}</div><button className="landliste__enkeltlinje__knapp" onClick={() => slettLand(land)}>-</button>
  </div>
);

ValgtLand.propTypes = {
  land: PT.string.isRequired,
  slettLand: PT.func.isRequired,
};

class VurderingLand extends Component {
  componentWillMount() {
    this.setState({
      valgteLand: [],
      landVelger: '',
      tilgjengeligeLand: [
        'Belgia',
        'Bulgaria',
        'Danmark',
        'Estland',
        'Finland',
        'Frankrike',
        'Hellas',
        'Irland',
        'Island',
        'Italia',
        'Kroatia',
        'Kypros',
        'Latvia',
        'Liechtenstein',
        'Litauen',
        'Luxembourg',
        'Malta',
        'Nederland',
        'Norge',
        'Polen',
        'Portugal',
        'Romania',
        'Slovakia',
        'Slovenia',
        'Spania',
        'Storbritannia og Nord-Irland',
        'Sverige',
        'Tsjekkia',
        'Tyskland',
        'Ungarn',
        'Østerrike',
        'EØS Generelt',
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
  leggTilLandHandler = (e, land = null) => {
    const landForTillegg = land || this.state.landVelger;
    if (landForTillegg === '') { return; }

    if (!this.state.valgteLand.includes(landForTillegg)) {
      this.setState(
        {
          valgteLand: [...this.state.valgteLand, landForTillegg],
          landVelger: '',
        }
      );
    }
  }

  /** Sletter et land fra state.valgteLand.
   *
   * @param land String Landet i sin helhet som skal slettes.
   */
  slettLandHandler = land => {
    this.setState({ valgteLand: [...this.state.valgteLand.filter(item => item !== land)] });
  }

  /** Event handler for håndtering av enter-tasten slik at saksbehandler kan skrive inn deler
   * av land-navnet. Dersom kun én match oppstår (feks 'frank' -> 'Frankrike'), så regnes dette som
   * et ønsket valg og leggTilLand kalles med det ene treffet som parameter.
   * @param e SyntetiskEvent React syntetisk event ved KeyDown.
   */
  landVelgerTastNedHandler = e => {
    if (e.keyCode === 13) {
      const landTreff = this.state.tilgjengeligeLand.filter(item => item.toLowerCase().includes(this.state.landVelger.toLowerCase()));

      if (landTreff.length === 1) {
        this.leggTilLandHandler(null, landTreff[0]);
      }
    }
  }

  /** Håndter endringer slik at inntasting oppdateres til lokal state og deretter tilbake til
   * form. (Standard React forms).
   * @param e SyntetiskEvent React syntetisk event ved onChange.
   */
  landVelgerEndringHandler = e => {
    this.setState({ landVelger: e.target.value });
  }

  render() {
    const { bekreftOgFortsett } = this.props;
    const { tilgjengeligeLand, valgteLand } = this.state;

    return (
      <div className="vurderingLand">
        <Nav.Undertittel>Utenlandsoppholdet:</Nav.Undertittel>
        <Nav.Fieldset legend="Når er søker i utlandet?">
          <Nav.Column xs="4">
            <DatoFelt label="Fra" />
          </Nav.Column>
          <Nav.Column xs="4">
            <DatoFelt label="Til" />
          </Nav.Column>
        </Nav.Fieldset>
        <Nav.Fieldset legend="Hvilke land skal søker arbeide i?">
          <Nav.Column xs="12">
            <div className="landliste">
              {this.state.valgteLand.map(item => <ValgtLand key={item} land={item} slettLand={this.slettLandHandler} />)}
              <div className="landliste__enkeltlinje">
                <Nav.Input
                  list="land"
                  label="Tast inn land"
                  bredde="s"
                  className="landliste__enkeltlinje__input"
                  value={this.state.landVelger}
                  onChange={this.landVelgerEndringHandler}
                  onKeyDown={this.landVelgerTastNedHandler}
                  onBlur={this.landVelgerFokusVekk}
                />
                <button
                  className="landliste__enkeltlinje__knapp landliste__enkeltlinje__knapp--leggtil"
                  onClick={this.leggTilLandHandler}>+</button>
                <datalist id="land">
                  {tilgjengeligeLand.map(item => (!valgteLand.includes(item) ? <option key={item} value={item} /> : ''))}
                </datalist>
              </div>
            </div>
          </Nav.Column>
        </Nav.Fieldset>
        <div className="fane__knapplinje">
          <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
  }
}

VurderingLand.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};


export default VurderingLand;
