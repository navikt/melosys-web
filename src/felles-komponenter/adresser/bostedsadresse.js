import React from 'react';
import * as MPT from '../../proptypes';

/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const Bostedsadresse = ({ bostedsadresse }) => {
  const {
    gateadresse, land, postnr, poststed,
  } = bostedsadresse;
  const gatenavn = gateadresse ? gateadresse.gatenavn : '';

  return bostedsadresse ? (
    <address className="bostedsadresse">
      {gatenavn || '-'}<br />
      {postnr || '-'} {poststed || ''}<br />
      {land || '-'}
    </address>
  ) : null;
};

Bostedsadresse.propTypes = {
  bostedsadresse: MPT.BostedsAdresse,
};

Bostedsadresse.defaultProps = {
  bostedsadresse: {},
};

export default Bostedsadresse;
