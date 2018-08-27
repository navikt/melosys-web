import React from 'react';
import * as MPT from '../../proptypes';

/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const GeneriskAdresse = ({ adresse }) => {
  if (!adresse) { return '(ingen tilgjengelig)'; }

  const {
    gateadresse, land, postnr, poststed,
  } = adresse;
  const gatenavn = gateadresse ? gateadresse.gatenavn : '';

  return (gatenavn || land || postnr || poststed) ? (
    <address className="bostedsadresse">
      {gatenavn}<br />
      {postnr} {poststed}<br />
      {land}
    </address>
  ) : '(ingen tilgjengelig)';
};

GeneriskAdresse.propTypes = {
  adresse: MPT.GeneriskAdresse,
};

GeneriskAdresse.defaultProps = {
  adresse: {},
};

export default GeneriskAdresse;
