import React from "react";

import * as MPT from "../../../../proptypes";
import * as Nav from "../../../../navFrontend";

import EnkeltDato from "../../../enkeltDato";
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
      <Nav.Typo.Undertittel>Antall timer timelønnet</Nav.Typo.Undertittel>
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
