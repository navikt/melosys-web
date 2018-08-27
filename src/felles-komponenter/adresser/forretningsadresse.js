import React from 'react';
import * as MPT from '../../proptypes';

import './adresse.css';

/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const Forretningsadresse = ({ forretningsadresse }) => {
  if (!forretningsadresse) { return '(ingen tilgjengelig)'; }

  const {
    gateadresse, land, postnr, poststed,
  } = forretningsadresse;
  const gatenavn = gateadresse ? gateadresse.gatenavn : '';

  return (gatenavn || land || postnr || poststed) ? (
    <address className="forretningsadresse">
      {gatenavn}<br />
      {postnr} {poststed}<br />
      {land}
    </address>
  ) : null;
};

Forretningsadresse.propTypes = {
  forretningsadresse: MPT.ForretningsAdresse,
};

Forretningsadresse.defaultProps = {
  forretningsadresse: {},
};

export default Forretningsadresse;
