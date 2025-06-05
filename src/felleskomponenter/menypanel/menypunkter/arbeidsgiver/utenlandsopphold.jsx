import * as MPT from "../../../../proptypes";
import * as Nav from "../../../../navFrontend";

import EnkeltDato from "../../../enkeltDato";
import TabellArbeidsgiver from "./tabellArbeidsgiver";

function Utenlandsopphold({ utenlandsopphold = [] }) {
  if (!utenlandsopphold) return null;

  const utenlandsoppholdArrayed = utenlandsopphold.map((linje) => [
    <EnkeltDato dato={linje.periode.fom} />,
    <EnkeltDato dato={linje.periode.tom} />,
    linje.rapporteringsperiode,
    linje.land,
  ]);

  return utenlandsopphold.length > 0 ? (
    <div>
      <Nav.Heading size="xsmall">Lønn opptjent i utlandet</Nav.Heading>
      <TabellArbeidsgiver
        kolonneNavn={["Startdato", "Sluttdato", "Rapporteringsperiode", "Land"]}
        tabellData={utenlandsoppholdArrayed}
        linjerPerSide={5}
      />
    </div>
  ) : null;
}

Utenlandsopphold.propTypes = {
  utenlandsopphold: MPT.Utenlandsopphold,
};

export default Utenlandsopphold;
