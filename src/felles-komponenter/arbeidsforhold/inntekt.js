import React, { Component } from 'react';
import ReactHighcharts from 'react-highcharts';
import moment from 'moment';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';
import Tabell from '../tabell/tabell';

import './inntekt.css';

/** Lister alle permisjoner i form av en table.
 *
 * @param permisjoner Array med permisjoner.
 */
class Inntekt extends Component {
  state = { visInntektTabell: false }

  toggleInntektTabellHandler = e => {
    e.preventDefault();
    this.setState({ visInntektTabell: !this.state.visInntektTabell });
  }

  render() {
    const { inntekt } = this.props;
    /**
     * Reduser inntekt for det aktuelle arbeidsforholdet ved å gjennomgå og vurdere hvilke inntekter
     * som er sikre og ikke. Det resulterende objektet ser slik ut
     * {
    '2017/01': { sikkertBeloep: 44000, usikkertBeloep: 0 },
    '2017/02': { sikkertBeloep: 44000, usikkertBeloep: 1000 },
    '2017/03': { sikkertBeloep: 44000, usikkertBeloep: 20000 },
    }
     */
    const grafInntekt = inntekt.reduce((samling, linje) => {
      // Sjekk om det finnes en opptjeningsperiode. Hvis ikke er denne inntekten usikker og blir senere
      // markert deretter i grafen.
      const harOpptjeningsPeriode = (linje.opptjeningsperiode && linje.opptjeningsperiode.fom);
      const inntektPeriode = harOpptjeningsPeriode ? moment(linje.opptjeningsperiode.fom, 'YYYYMMDD').format('YYYY-MM') : linje.utbetaltIPeriode;
      // Lag et kopi av objektet fra samlingen for den aktuelle inntektPeriode. Dette gjør at vi kan legge til beløp (sikkert eller usikkert)
      // dersom vi har fått flere inntekter innenfor samme periode.
      const inntektDelObjekt = samling[inntektPeriode] ? { ...samling[inntektPeriode] } : { sikkertBeloep: 0, usikkertBeloep: 0 };

      // Sett inn oppdaterte beløp (pluss evt tidligere inn i del-objektet.
      inntektDelObjekt.sikkertBeloep = harOpptjeningsPeriode ? (inntektDelObjekt.sikkertBeloep + linje.beloep) : inntektDelObjekt.sikkertBeloep;
      inntektDelObjekt.usikkertBeloep = !harOpptjeningsPeriode ? (inntektDelObjekt.usikkertBeloep + linje.beloep) : inntektDelObjekt.usikkertBeloep;

      return { ...samling, [inntektPeriode]: inntektDelObjekt };
    }, {});

    const grafConfig = {
      rangeSelector: {
        selected: 0,
      },
      title: {
        text: '',
      },
      chart: {
        type: 'column',
        description: 'Grafen viser utvikling i inntekt knyttet til arbeidsforholdet. Inntekt som som har en kjent opptjeningsperiode er ' +
        'markert som sikker. Inntekt hvor kun utbetalingsperiode er kjent er markett som usikker.',
      },
      yAxis: {
        min: 0,
        title: {
          text: '',
        },
      },
      xAxis: {
        categories: Object.keys(grafInntekt),
        crosshair: true,
        description: 'Perioder med inntekt.',
      },
      plotOptions: {
        series: {
          stacking: 'normal',
        },
      },
      series: [
        {
          name: 'Usikker periode',
          data: Object.values(grafInntekt).map(linje => linje.usikkertBeloep),
          color: '#b7b1a9',
          description: 'Beskrivelse av usikkerhet',
        },
        {
          name: 'Sikker periode',
          data: Object.values(grafInntekt).map(linje => linje.sikkertBeloep),
          color: '#0067c5',
          description: 'Beskrivelse av usikkerhet',
        },
      ],
    };

    /** Basert på grafInntekt (som nå har gjort en vurdering av sikker vs usikker periode), lag en array-versjon som
     * kan serveres til Tabell-komponenten. Denne trengs for UU, men vises kun ved klikk.
     */
    const inntektArrayed = Object.keys(grafInntekt).map(periode => (
      // Tabell-komponenten er generisk og trenger at hver linje
      // kommer inn som en ren array og som rendres gjennomsiktig ut i GUI.
      // All formattering eller komponent-innsett må derfor gjøres her og returnere
      // en ny ferdigtygget array.
      [
        periode,
        grafInntekt[periode].sikkertBeloep,
        grafInntekt[periode].usikkertBeloep,
      ]));

    const uuTabell = this.state.visInntektTabell ? (
      <div>
        <Nav.Undertittel>Inntekt</Nav.Undertittel>
        <Tabell
          kolonneNavn={['Periode', 'Sikker inntekt', 'Usikker inntekt']}
          tabellData={inntektArrayed}
          linjerPerSide={5}
        />
      </div>
    ) : null;

    return inntekt.length > 0 ? (
      <div className="inntekt">
        <div className="my-pretty-chart-container">
          <ReactHighcharts config={grafConfig} />
        </div>
        <Nav.Knapp mini onClick={this.toggleInntektTabellHandler} className="vistabell__knapp">Vis tabell for inntekten</Nav.Knapp>
        {uuTabell}
      </div>
    ) : null;
  }
}

Inntekt.propTypes = {
  inntekt: MPT.Permisjoner,
};

Inntekt.defaultProps = {
  inntekt: [],
};

export default Inntekt;
