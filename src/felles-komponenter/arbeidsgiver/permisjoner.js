import React from 'react';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';

import EnkeltDato from '../datoOmrade/enkeltDato';
import Tabell from '../tabell/tabell';

/** Lister alle permisjoner i form av en table.
 *
 * @param permisjoner Array med permisjoner.
 */
const Permisjoner = ({ permisjoner }) => {
  if (!permisjoner) return null;

  const permisjonerArrayed = permisjoner.map(linje => (
    // Tabell-komponenten er generisk og trenger at hver linje
    // kommer inn som en ren array og som rendres gjennomsiktig ut i GUI.
    // All formattering eller komponent-innsett må derfor gjøres her og returnere
    // en ny ferdigtygget array.
    [
      <EnkeltDato dato={linje.permisjonsPeriode.fom} />,
      <EnkeltDato dato={linje.permisjonsPeriode.tom} />,
      linje.permisjonOgPermittering,
      linje.permisjonsprosent,
    ]));

  return permisjoner.length > 0 ? (
    <div className="permisjoner">
      <Nav.Undertittel>Permisjoner</Nav.Undertittel>
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
