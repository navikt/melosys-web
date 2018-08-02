import React from 'react';
import * as MPT from '../../proptypes';

import './adresse.css';

/** Organisasjon formatterer navn adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const Organisasjonsadresse = ({ organisasjon }) => {
  const { forretningsadresse = {}, navn = '' } = organisasjon;
  const {
    gateadresse, land, postnr, poststed,
  } = forretningsadresse;
  const gatenavn = gateadresse ? gateadresse.gatenavn : '';

  return Object.keys(organisasjon).length > 0 ? (
    <address className="organisasjonsadresse">
      {navn || '-'}<br />
      {gatenavn || '-'}<br />
      {postnr || '-'} {poststed || '-'}<br />
      {land || '-'}
    </address>
  ) : null;
};

Organisasjonsadresse.propTypes = {
  organisasjon: MPT.Organisasjon,
};

Organisasjonsadresse.defaultProps = {
  organisasjon: {},
};

export default Organisasjonsadresse;
