import React from 'react';
import * as MPT from '../../proptypes';

import './adresse.css';

/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const Forretningsadresse = ({ forretningsadresse }) => {
  const {
    gateadresse, land, postnr, poststed,
  } = forretningsadresse;
  const gatenavn = gateadresse ? gateadresse.gatenavn : '';

  return forretningsadresse ? (
    <address className="forretningsadresse">
      {gatenavn || '-'}<br />
      {postnr || '-'} {poststed || '-'}<br />
      {land || '-'}
    </address>
  ) : null;
};

Forretningsadresse.propTypes = {
  forretningsadresse: MPT.BostedsAdresse,
};

Forretningsadresse.defaultProps = {
  forretningsadresse: {},
};

export default Forretningsadresse;
