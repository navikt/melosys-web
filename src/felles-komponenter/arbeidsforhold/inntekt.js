import React from 'react';
import ReactHighcharts from 'react-highcharts';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';
import Tabell from '../tabell/tabell';


/** Lister alle permisjoner i form av en table.
 *
 * @param permisjoner Array med permisjoner.
 */
const Inntekt = ({ inntekt }) => {
  const inntektArrayed = inntekt.map(linje => (
    // Tabell-komponenten er generisk og trenger at hver linje
    // kommer inn som en ren array og som rendres gjennomsiktig ut i GUI.
    // All formattering eller komponent-innsett må derfor gjøres her og returnere
    // en ny ferdigtygget array.
    [
      linje.utbetaltIPeriode,
      linje.beloep,
      linje.beskrivelse,
    ])
  );

  //const inntektGrafData = inntekt.map(linje => ([linje.utbetaltIPeriode, linje.beloep]));
  const sikkerInntekt = [45000, 43000, 43000, 43000, 33300, 50000];

  const usikkerInntekt = [10000, 12000];

  const config = {
    rangeSelector: {
      selected: 0,
    },
    title: {
      text: '',
    },
    chart: {
      type: 'column',
    },
    yAxis: {
      min: 0,
      title: {
        text: ''
      }
    },
    xAxis: {
      categories: [
        '2017/01',
        '2017/02',
        '2017/03',
        '2017/04',
        '2017/05',
        '2017/06',
      ],
      crosshair: true,
    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    },
    series: [
      {
        name: 'Usikkert',
        data: usikkerInntekt,
        color: '#b7b1a9',
        tooltip: {
          valueDecimals: 2,
        }
      },
      {
        name: 'Sikkert',
        data: sikkerInntekt,
        color: '#0067c5',
        tooltip: {
          valueDecimals: 2,
        }
      }
    ]
  };


  return inntekt.length > 0 ? (
    <div className="inntekt">
      <div className={'my-pretty-chart-container'}>
        <ReactHighcharts config={config} />

      </div>
      <Nav.Undertittel>Inntekt</Nav.Undertittel>
      <Tabell
        kolonneNavn={['Periode', 'Beløp', 'Beskrivelse']}
        tabellData={inntektArrayed}
        linjerPerSide={5}
      />
    </div>
  ) : null;
};

Inntekt.propTypes = {
  inntekt: MPT.Permisjoner,
};

Inntekt.defaultProps = {
  inntekt: [],
};

export default Inntekt;
