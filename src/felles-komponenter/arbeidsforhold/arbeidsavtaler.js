import React, { Component } from 'react';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';
import Tabell from '../tabell/tabell';

import EnkeltDato from '../datoOmrade/enkeltDato';

import './arbeidsavtaler.css';

class Arbeidsavtaler extends Component {
  state = { visHistoriskeArbeidsavtaler: false }

  toggleInntektTabellHandler = e => {
    e.preventDefault();
    this.setState({ visHistoriskeArbeidsavtaler: !this.state.visHistoriskeArbeidsavtaler });
  }

  render() {
    const { arbeidsavtaler = [] } = this.props;
    const { visHistoriskeArbeidsavtaler } = this.state;

    const nyesteArbeidsavtale = arbeidsavtaler[0] || {};
    const historiskeArbeidsavtaler = arbeidsavtaler.filter((arbeidsavtalen, index) => index > 0);

    // Tabell-komponenten er agnostisk med tanke på colonner og trenger disse som en array. Gjør derfor
    // en reducer slik at hvert felt kommer inn i rekkefølge som en array istedet for et key/value-objekt.
    const tabellTilpassetArbeidsavtaler = historiskeArbeidsavtaler.reduce((samling, arbeidsavtale) => {
      const {
        gyldigTil = '-', yrke, arbeidstidsordning, avtaltArbeidstimerPerUke, stillingsprosent, antallTimerFraGammeltRegister = '-', endringsdatoStillingsprosent,
      } = arbeidsavtale;
      return [...samling, [gyldigTil, yrke, arbeidstidsordning, avtaltArbeidstimerPerUke, antallTimerFraGammeltRegister, stillingsprosent, EnkeltDato(endringsdatoStillingsprosent)]];
    }, []);

    // Lag eventuelle elementer som skal rendres ut senere, slik at vi slipper mye logikk i selve return-blokken.
    const visMerKnappElement = historiskeArbeidsavtaler.length > 0 ? (
      <Nav.Knapp
        mini
        onClick={this.toggleInntektTabellHandler}
        className="vistabell__knapp">{visHistoriskeArbeidsavtaler ? 'Skjul' : 'Vis'} tidligere arbeidsavtaler
      </Nav.Knapp>) : null;

    const historiskeArbeidsAvtalerElement = visHistoriskeArbeidsavtaler ? (
      <div><Nav.Undertittel>Tidligere arbeidsavtaler</Nav.Undertittel><Tabell
        tabellData={tabellTilpassetArbeidsavtaler}
        kolonneNavn={['Gyldig til', 'Yrke', 'Arbeidsordning', 'Timer pr uke', 'Timer gammelt reg.', 'Stillingsprosent', 'Sist endret']}
        linjerPerSide={5}
      />
      </div>)
      :
      null;

    return (
      <div className="arbeidsavtaler">
        <div className="arbeidsavtale">
          <Nav.Column xs="6">
            <dl className="arbeidsforholdet__detaljer">
              <dt>Yrke</dt>
              <dd>{nyesteArbeidsavtale.yrke || '-'}</dd>
              <dt>Arbeidstidsordning</dt>
              <dd>{nyesteArbeidsavtale.arbeidstidsordning}</dd>
            </dl>
          </Nav.Column>
          <Nav.Column xs="6">
            <dl className="arbeidsforholdet__detaljer">
              <dt>Stillingsprosent</dt>
              <dd>{nyesteArbeidsavtale.stillingsprosent || '-'}</dd>
              <dt>Antall timer pr uke</dt>
              <dd>{nyesteArbeidsavtale.beregnetAntallTimerPrUke || '-'}</dd>
              {nyesteArbeidsavtale.antallTimerFraGammeltRegister && <div><dt>Antall timer fra gammelt register</dt><dd>nyesteArbeidsavtale.antallTimerFraGammeltRegister</dd></div> }
              <dt>Stillingsprosent endret</dt>
              <dd><EnkeltDato dato={nyesteArbeidsavtale.endringsdatoStillingsprosent} /></dd>
            </dl>
          </Nav.Column>
        </div>
        { visMerKnappElement }
        { historiskeArbeidsAvtalerElement}
      </div>
    );
  }
}

Arbeidsavtaler.propTypes = {
  arbeidsavtaler: MPT.Arbeidsavtaler,
};

Arbeidsavtaler.defaultProps = {
  arbeidsavtaler: [],
};

export default Arbeidsavtaler;
