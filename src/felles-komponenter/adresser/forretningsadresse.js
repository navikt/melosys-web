import React from 'react';
import PT from 'prop-types';

/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const Forretningsadresse = ({ forretningsadresse }) => {
  const { gateadresse, land, postnr, poststed } = forretningsadresse;
  const gatenavn = gateadresse ? gateadresse.gatenavn : '';

  return forretningsadresse ? (
    <div>
      {gatenavn}<br />
      {postnr} {poststed}<br />
      {land}
    </div>
  ) : null;
};

Forretningsadresse.propTypes = {
  forretningsadresse: PT.object.isRequired,
};

Forretningsadresse.defaultProps = {
  forretningsadresse: {},
};

export default Forretningsadresse;
