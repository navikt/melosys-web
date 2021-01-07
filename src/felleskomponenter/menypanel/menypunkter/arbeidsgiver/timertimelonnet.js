import React from "react";

import * as MPT from "../../../../proptypes";
import * as Nav from "../../../../utils/navFrontend";

import EnkeltDato from "../../../datoOmrade/enkeltDato";
import Tabell from "../../../tabell/tabell";

const TimerTimelonnet = ({ timerTimelonnet }) => {
  if (!timerTimelonnet) return null;

  const timelonnetArrayed = timerTimelonnet.map((linje) => [
    <EnkeltDato dato={linje.timelonnetPeriode.fom} />,
    <EnkeltDato dato={linje.timelonnetPeriode.tom} />,
    linje.rapporteringsPeriode,
    linje.antallTimer,
  ]);

  return timerTimelonnet.length > 0 ? (
    <div>
      <Nav.typo.Undertittel>Antall timer timelønnet</Nav.typo.Undertittel>
      <Tabell
        kolonneNavn={["Startdato", "Sluttdato", "Rapporteringsperiode", "Antall timer"]}
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
