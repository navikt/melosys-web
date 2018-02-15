import React, { Component } from 'react';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';
import Tabell from '../tabell/tabell';

import EnkeltDato from '../datoOmrade/enkeltDato';

import './arbeidsavtaler.css';

class Arbeidsavtaler extends Component {
  state = { visHostoriskeArbeidsavtaler: false }

  toggleInntektTabellHandler = e => {
    e.preventDefault();
    this.setState({ visHostoriskeArbeidsavtaler: !this.state.visHostoriskeArbeidsavtaler });
  }

  render() {
    const { arbeidsavtaler = [] } = this.props;
    const { visHostoriskeArbeidsavtaler } = this.state;
    const grafArbeidsavtale = arbeidsavtaler.reduce((samling, arbeidsavtale) => {
      const {
        yrke, arbeidstidsordning, avtaltArbeidstimerPerUke, stillingsprosent, antallTimerFraGammeltRegister = '-', endringsdatoStillingsprosent,
      } = arbeidsavtale;
      return [...samling, [yrke, arbeidstidsordning, avtaltArbeidstimerPerUke, antallTimerFraGammeltRegister, stillingsprosent, EnkeltDato(endringsdatoStillingsprosent)]];
    }, []);
    const nyesteArbeidsavtale = arbeidsavtaler[0] || [];

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
              <dd>{nyesteArbeidsavtale.avtaltArbeidstimerPerUke || '-'}</dd>
              <dt>Antall timer pr uke</dt>
              <dd>{nyesteArbeidsavtale.beregnetAntallTimerPrUke || '-'}</dd>
              {nyesteArbeidsavtale.antallTimerFraGammeltRegister && <div><dt>Antall timer fra gammelt register</dt><dd>nyesteArbeidsavtale.antallTimerFraGammeltRegister</dd></div> }
              <dt>Stillingsprosent endret</dt>
              <dd><EnkeltDato dato={nyesteArbeidsavtale.endringsdatoStillingsprosent} /></dd>
            </dl>
          </Nav.Column>
        </div>
        <Nav.Knapp mini onClick={this.toggleInntektTabellHandler} className="vistabell__knapp">{visHostoriskeArbeidsavtaler ? 'Skjul' : 'Vis'} tidligere arbeidsavtaler</Nav.Knapp>

        {visHostoriskeArbeidsavtaler && (
          <div><Nav.Undertittel>Tidligere arbeidsavtaler</Nav.Undertittel><Tabell
            tabellData={grafArbeidsavtale}
            kolonneNavn={['Yrke', 'Arbeidsordning', 'Timer pr uke', 'Timer gammelt reg.', 'Stillingsprosent', 'Sist endret']}
            linjerPerSide={5}
          />
          </div>
        )}
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
