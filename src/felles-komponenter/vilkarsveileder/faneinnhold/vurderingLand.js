import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

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

  leggTilLand = (e, land = null) => {
    const landForTillegg = land || this.state.landVelger;

    if (!this.state.valgteLand.includes(landForTillegg)) {
      this.setState(
        {
          valgteLand: [...this.state.valgteLand, landForTillegg],
          landVelger: '',
        }
      );
    }
  }

  slettLand = land => {
    this.setState({ valgteLand: [...this.state.valgteLand.filter(item => item !== land)] });
  }

  landVelgerEndring = e => {
    this.setState({ landVelger: e.target.value });
  }

  landVelgerTastNed = e => {
    if (e.keyCode === 13) {
      const landTreff = this.state.tilgjengeligeLand.filter(item => item.toLowerCase().includes(this.state.landVelger.toLowerCase()));

      if (landTreff.length === 1) {
        this.leggTilLand(null, landTreff[0]);
      }
    }
  }

  render() {
    const { bekreftOgFortsett } = this.props;
    const { tilgjengeligeLand, valgteLand } = this.state;

    return (
      <div className="vurderingLand">
        <Nav.Undertittel>Utenlandsoppholdet:</Nav.Undertittel>
        <Nav.Fieldset legend="Når er søker i utlandet?">
          <Nav.Column xs="4">
            <Nav.Input label="Fra" bredde="s" />
          </Nav.Column>
          <Nav.Column xs="4">
            <Nav.Input label="Til" bredde="s" />
          </Nav.Column>
        </Nav.Fieldset>
        <Nav.Fieldset legend="Hvilke land skal søker arbeide i?">
          <Nav.Column xs="12">
            <div className="landliste">
              <div className="landliste__enkeltlinje">
                <Nav.Input
                  list="land"
                  label="Tast inn land"
                  bredde="s"
                  className="landliste__enkeltlinje__input"
                  value={this.state.landVelger}
                  onChange={this.landVelgerEndring}
                  onKeyDown={this.landVelgerTastNed}
                  onBlur={this.landVelgerFokusVekk}
                />
                <button
                  className="landliste__enkeltlinje__knapp landliste__enkeltlinje__knapp--leggtil"
                  onClick={this.leggTilLand}>+</button>
                <datalist id="land">
                  {tilgjengeligeLand.map(item => (!valgteLand.includes(item) ? <option key={item} value={item} /> : ''))}
                </datalist>
              </div>
              {this.state.valgteLand.map(item => <ValgtLand key={item} land={item} slettLand={this.slettLand} />)}
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
