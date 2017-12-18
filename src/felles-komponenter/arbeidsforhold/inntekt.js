import React from 'react';
import { Chart } from 'react-google-charts';

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

  const inntektGrafData = inntekt.map(linje => ([linje.utbetaltIPeriode, linje.beloep]));

  return inntekt.length > 0 ? (
    <div className="inntekt">
      <div className={'my-pretty-chart-container'}>
        <Chart
          chartType="ColumnChart"
          data={[['Periode', 'Inntekt'], ...inntektGrafData]}
          options={{ legend: { position: 'none' } }}
          graph_id="BarChart"
          width="100%"
          height="400px"
          legend_toggle={false}
        />
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
