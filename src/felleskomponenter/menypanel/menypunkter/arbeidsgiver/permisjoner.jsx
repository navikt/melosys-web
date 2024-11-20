import * as MPT from "../../../../proptypes";
import * as Nav from "../../../../navFrontend";

import EnkeltDato from "../../../enkeltDato";
import TabellArbeidsgiver from "./tabellArbeidsgiver";

const Permisjoner = ({ permisjoner }) => {
  if (!permisjoner) return null;

  const permisjonerArrayed = permisjoner.map((linje) => {
    const { permisjonsprosent, permisjonOgPermittering, permisjonsPeriode } = linje;

    const fixedPermisjonsprosent = permisjonsprosent ? permisjonsprosent.toFixed(1) : 0;

    return [
      <EnkeltDato dato={permisjonsPeriode.fom} />,
      <EnkeltDato dato={permisjonsPeriode.tom} />,
      permisjonOgPermittering,
      fixedPermisjonsprosent,
    ];
  });

  return permisjoner.length > 0 ? (
    <div className="permisjoner">
      <Nav.Heading size="xsmall">Permisjoner</Nav.Heading>
      <TabellArbeidsgiver
        kolonneNavn={["Startdato", "Sluttdato", "Type", "Prosent"]}
        tabellData={permisjonerArrayed}
        linjerPerSide={5}
      />
    </div>
  ) : null;
};

Permisjoner.propTypes = {
  permisjoner: MPT.Permisjoner,
};

Permisjoner.defaultProps = {
  permisjoner: [],
};

export default Permisjoner;
