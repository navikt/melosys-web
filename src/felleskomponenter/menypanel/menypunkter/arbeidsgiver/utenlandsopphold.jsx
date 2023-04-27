import React from "react";

import * as MPT from "../../../../proptypes";
import * as Nav from "../../../../navFrontend";

import EnkeltDato from "../../../enkeltDato";
import Tabell from "../../../tabell/tabell";

const Utenlandsopphold = ({ utenlandsopphold }) => {
  if (!utenlandsopphold) return null;

  const utenlandsoppholdArrayed = utenlandsopphold.map((linje) => [
    <EnkeltDato dato={linje.periode.fom} />,
    <EnkeltDato dato={linje.periode.tom} />,
    linje.rapporteringsperiode,
    linje.land,
  ]);

  return utenlandsopphold.length > 0 ? (
    <div>
      <Nav.Typo.Undertittel>Lønn opptjent i utlandet</Nav.Typo.Undertittel>
      <Tabell
        kolonneNavn={["Startdato", "Sluttdato", "Rapporteringsperiode", "Land"]}
        tabellData={utenlandsoppholdArrayed}
        linjerPerSide={5}
      />
    </div>
  ) : null;
};

Utenlandsopphold.propTypes = {
  utenlandsopphold: MPT.Utenlandsopphold,
};

Utenlandsopphold.defaultProps = {
  utenlandsopphold: [],
};

export default Utenlandsopphold;
