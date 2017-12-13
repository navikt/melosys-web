import React from 'react';

import * as MPT from '../../proptypes/index';

import EnkeltDato from '../datoOmrade/enkeltDato';

const uuid = require('uuid/v4');

/** Lister en enkeltlinje for antall timer timelønnet.
 *
 * @param { props.timeLine } Enkeltlinje for timelønn.
 */
const TimeLinje = ({ timeLinje }) => {
  const { timelonnetPeriode, rapporteringsPeriode, antallTimer } = timeLinje;
  return (
    <tr className="border-bottom">
      <td>{<EnkeltDato dato={timelonnetPeriode.fom} />}</td>
      <td>{<EnkeltDato dato={timelonnetPeriode.tom} />}</td>
      <td>{rapporteringsPeriode}</td>
      <td>{antallTimer}</td>
    </tr>
  );
};

TimeLinje.propTypes = {
  timeLinje: MPT.TimerTimelonnetLinje.isRequired,
};

/** Lister alle timer timelønnet i form av en table.
 *
 * @param permisjoner Array med timelonnet.
 */
const TimerTimelonnet = ({ timerTimelonnet }) => (
  <div className="permisjoner">
    <table className="tabellutlisting">
      <tbody>
        <tr>
          <th>Startdato</th>
          <th>Sluttdato</th>
          <th>Rapporteringsperiode</th>
          <th>Antall timer</th>
        </tr>
        { timerTimelonnet.map(timeLinje => <TimeLinje key={uuid()} timeLinje={timeLinje} />) }
      </tbody>
    </table>
  </div>
);

TimerTimelonnet.propTypes = {
  timerTimelonnet: MPT.TimerTimelonnet,
};

TimerTimelonnet.defaultProps = {
  timerTimelonnet: [],
};

export default TimerTimelonnet;
