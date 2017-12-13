import React from 'react';

import * as MPT from '../../proptypes/index';
import Tabell from '../tabell/tabell';

import EnkeltDato from '../datoOmrade/enkeltDato';

/** Lister alle timer timelønnet i form av en table.
 *
 * @param permisjoner Array med timelonnet.
 */
const TimerTimelonnet = ({ timerTimelonnet }) => {
  const timelonnetArrayed = timerTimelonnet.map(linje => {
    const linjeTilArray = [
      <EnkeltDato dato={linje.timelonnetPeriode.fom} />,
      <EnkeltDato dato={linje.timelonnetPeriode.tom} />,
      linje.rapporteringsPeriode,
      linje.antallTimer,
    ];
    return linjeTilArray;
  });

  return (
    <Tabell
      className="timertimelonnet"
      kolonneNavn={['Startdato', 'Sluttdato', 'Rapporteringsperiode', 'Antall timer']}
      tabellData={timelonnetArrayed}
      linjerPerSide={5}
    />
  );
};

TimerTimelonnet.propTypes = {
  timerTimelonnet: MPT.TimerTimelonnet,
};

TimerTimelonnet.defaultProps = {
  timerTimelonnet: [],
};

export default TimerTimelonnet;
