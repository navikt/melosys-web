import React from 'react';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';

import EnkeltDato from '../../komponenter/datoOmrade/enkeltDato';
import Tabell from '../../komponenter/tabell/tabell';

/** Lister alle timer utenlandsopphold i form av en table.
 *
 * @param permisjoner Array med timelonnet.
 */
const Utenlandsopphold = ({ utenlandsopphold }) => {
  if (!utenlandsopphold) return null;

  const utenlandsoppholdArrayed = utenlandsopphold.map(linje => (
    // Tabell-komponenten er generisk og trenger at hver linje
    // kommer inn som en ren array og som rendres gjennomsiktig ut i GUI.
    // All formattering eller komponent-innsett må derfor gjøres her og returnere
    // en ny ferdigtygget array.
    [
      <EnkeltDato dato={linje.periode.fom} />,
      <EnkeltDato dato={linje.periode.tom} />,
      linje.rapporteringsperiode,
      linje.land,
    ]));

  return utenlandsopphold.length > 0 ? (
    <div>
      <Nav.Undertittel>Lønn opptjent i utlandet</Nav.Undertittel>
      <Tabell
        kolonneNavn={['Startdato', 'Sluttdato', 'Rapporteringsperiode', 'Land']}
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
