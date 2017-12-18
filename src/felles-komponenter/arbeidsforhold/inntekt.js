import React from 'react';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';

import Tabell from '../tabell/tabell';

/** Lister alle permisjoner i form av en table.
 *
 * @param permisjoner Array med permisjoner.
 */
const Inntekt = ({ inntekt }) => {
  console.log(inntekt);
  const inntektArrayed = inntekt.map(linje => (
    // Tabell-komponenten er generisk og trenger at hver linje
    // kommer inn som en ren array og som rendres gjennomsiktig ut i GUI.
    // All formattering eller komponent-innsett må derfor gjøres her og returnere
    // en ny ferdigtygget array.
    [
      linje.utbetaltIPeriode,
      linje.beloep,
      linje.beskrivelse,
    ])
  );

  return inntekt.length > 0 ? (
    <div className="permisjoner">
      <Nav.Undertittel>Inntekt</Nav.Undertittel>
      <Tabell
        kolonneNavn={['Periode', 'Beløp', 'Beskrivelse']}
        tabellData={inntektArrayed}
        linjerPerSide={5}
      />
    </div>
  ) : null;
};

Inntekt.propTypes = {
  inntekt: MPT.Permisjoner,
};

Inntekt.defaultProps = {
  inntekt: [],
};

export default Inntekt;
