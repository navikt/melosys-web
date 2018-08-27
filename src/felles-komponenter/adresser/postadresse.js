import React from 'react';
import * as MPT from '../../proptypes';

/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const Postadresse = ({ postadresse }) => {
  if (!postadresse) { return '(ingen tilgjengelig)'; }

  const {
    gateadresse, land, postnr, poststed,
  } = postadresse;
  const gatenavn = gateadresse ? gateadresse.gatenavn : '';

  return (gatenavn || land || postnr || poststed) ? (
    <address className="postadresse">
      {gatenavn}<br />
      {postnr} {poststed}<br />
      {land}
    </address>
  ) : '(ingen tilgjengelig)';
};

Postadresse.propTypes = {
  postadresse: MPT.PostAdresse,
};

Postadresse.defaultProps = {
  postadresse: {},
};

export default Postadresse;
