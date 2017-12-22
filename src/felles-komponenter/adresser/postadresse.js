import React from 'react';
import * as MPT from '../../proptypes';

/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const Postadresse = ({ postadresse }) => {
  const {
    gateadresse, land, postnr, poststed,
  } = postadresse;
  const gatenavn = gateadresse ? gateadresse.gatenavn : '';

  return postadresse ? (
    <div>
      {gatenavn || '-'}<br />
      {postnr || '-'} {poststed || '-'}<br />
      {land || '-'}
    </div>
  ) : null;
};

Postadresse.propTypes = {
  postadresse: MPT.BostedsAdresse,
};

Postadresse.defaultProps = {
  postadresse: {},
};

export default Postadresse;
