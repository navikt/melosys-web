import React from 'react';

import * as MPT from '../../../../proptypes';
import * as Nav from '../../../../utils/navFrontend';

import EnkeltDato from '../../../../felleskomponenter/datoOmrade/enkeltDato';
import Tabell from '../../../../felleskomponenter/tabell/tabell';

/** Lister alle permisjoner i form av en table.
 *
 * @param permisjoner Array med permisjoner.
 */
const Permisjoner = ({ permisjoner }) => {
  if (!permisjoner) return null;

  const permisjonerArrayed = permisjoner.map(linje => {
    const { permisjonsprosent, permisjonOgPermittering, permisjonsPeriode } = linje;
    // Tabell-komponenten er generisk og trenger at hver linje
    // kommer inn som en ren array og som rendres gjennomsiktig ut i GUI.
    // All formattering eller komponent-innsett må derfor gjøres her og returnere
    // en ny ferdigtygget array.
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
      <Nav.typo.Undertittel>Permisjoner</Nav.typo.Undertittel>
      <Tabell
        kolonneNavn={['Startdato', 'Sluttdato', 'Type', 'Prosent']}
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
