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
      },
      {
        name: 'Sikkert',
        data: Object.values(grafInntekt).map(linje => linje.sikkertBeloep),
        color: '#0067c5',
      },
    ],
  };

  return inntekt.length > 0 ? (
    <div className="inntekt">
      <div className={'my-pretty-chart-container'}>
        <ReactHighcharts config={grafConfig} />
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
