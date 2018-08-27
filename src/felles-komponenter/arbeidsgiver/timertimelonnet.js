import React from 'react';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';

import EnkeltDato from '../datoOmrade/enkeltDato';
import Tabell from '../tabell/tabell';

/** Lister alle timer timelønnet i form av en table.
 *
 * @param permisjoner Array med timelonnet.
 */
const TimerTimelonnet = ({ timerTimelonnet }) => {
  if (!timerTimelonnet) return null;

  const timelonnetArrayed = timerTimelonnet.map(linje => (
    // Tabell-komponenten er generisk og trenger at hver linje
    // kommer inn som en ren array og som rendres gjennomsiktig ut i GUI.
    // All formattering eller komponent-innsett må derfor gjøres her og returnere
    // en ny ferdigtygget array.
    [
      <EnkeltDato dato={linje.timelonnetPeriode.fom} />,
      <EnkeltDato dato={linje.timelonnetPeriode.tom} />,
      linje.rapporteringsPeriode,
      linje.antallTimer,
    ]));

  return timerTimelonnet.length > 0 ? (
    <div>
      <Nav.Undertittel>Antall timer timelønnet</Nav.Undertittel>
      <Tabell
        kolonneNavn={['Startdato', 'Sluttdato', 'Rapporteringsperiode', 'Antall timer']}
        tabellData={timelonnetArrayed}
        linjerPerSide={5}
      />
    </div>
  ) : null;
};

TimerTimelonnet.propTypes = {
  timerTimelonnet: MPT.TimerTimelonnet,
};

TimerTimelonnet.defaultProps = {
  timerTimelonnet: [],
};

export default TimerTimelonnet;
