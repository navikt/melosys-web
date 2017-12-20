import React from 'react';
import ReactHighcharts from 'react-highcharts';
import moment from 'moment';

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

  const grafInntekt = inntekt.reduce((samling, linje) => {
    // Sjekk om det finnes en opptjeningsperiode. Hvis ikke er denne inntekten usikker og blir senere
    // markert deretter i grafen.
    const harOpptjeningsPeriode = (linje.opptjeningsperiode && linje.opptjeningsperiode.fom);
    const inntektPeriode = harOpptjeningsPeriode ? moment(linje.opptjeningsperiode.fom, 'YYYYMMDD').format('YYYY-MM') : linje.utbetaltIPeriode;
    // Lag objektet som skal settes inn i graf-modellen. Objektet får nøkkelen 'sikkertBeloep' eller 'usikkertBeloep'
    // avhengig av om inntekten har en definert opptjeningsperiode eller ikke.
    const inntektDelObjekt = harOpptjeningsPeriode ? { sikkertBeloep: linje.beloep, usikkertBeloep: 0 } : { usikkertBeloep: linje.beloep, sikkertBeloep: 0 };

    return { ...samling, [inntektPeriode]: { ...inntektDelObjekt } };
  }, {});


  console.log(grafInntekt);

  const dummy = {
    '2017/01': { sikkertBeloep: 44000, usikkertBeloep: 0 },
    '2017/02': { sikkertBeloep: 44000, usikkertBeloep: 1000 },
    '2017/03': { sikkertBeloep: 44000, usikkertBeloep: 20000 },
    '2017/04': { sikkertBeloep: 44000, usikkertBeloep: 0 },
    '2017/05': { sikkertBeloep: 44000, usikkertBeloep: 20000 },
    '2017/06': { sikkertBeloep: 44000, usikkertBeloep: 0 },
  };

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
        text: '',
      },
    },
    xAxis: {
      categories: Object.keys(grafInntekt),
      crosshair: true,
    },
    plotOptions: {
      series: {
        stacking: 'normal',
      },
    },
    series: [
      {
        name: 'Usikkert',
        data: Object.values(grafInntekt).map(linje => linje.usikkertBeloep),
        color: '#b7b1a9',
        tooltip: {
          valueDecimals: 2,
        },
      },
      {
        name: 'Sikkert',
        data: Object.values(grafInntekt).map(linje => linje.sikkertBeloep),
        color: '#0067c5',
        tooltip: {
          valueDecimals: 2,
        },
      },
    ],
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
