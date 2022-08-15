import React from "react";

import * as MPT from "../../../../proptypes";
import * as Nav from "../../../../navFrontend";

import EnkeltDato from "../../../enkeltDato";
import Tabell from "../../../tabell/tabell";

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
      <Nav.Typo.Undertittel>Permisjoner</Nav.Typo.Undertittel>
      <Tabell
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
