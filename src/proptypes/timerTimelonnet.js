import PT from 'prop-types';

import { Periode } from './periode';

const TimerTimelonnetLinjePropType = PT.shape({
  timelonnetPeriode: Periode,
  rapporteringsPeriode: PT.string,
  antallTimer: PT.number,
});

const TimerTimelonnetPropType = PT.arrayOf(TimerTimelonnetLinjePropType);

export {
  TimerTimelonnetLinjePropType as TimerTimelonnetLinje,
  TimerTimelonnetPropType as TimerTimelonnet,
};
