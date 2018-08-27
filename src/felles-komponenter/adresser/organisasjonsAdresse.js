import React from 'react';
import * as MPT from '../../proptypes';

import './adresse.css';

/** Organisasjon formatterer navn adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const OrganisasjonsAdresse = ({ organisasjon }) => {
  if (!organisasjon) return '(ingen tilgjengelig)';

  const { forretningsadresse, navn = '' } = organisasjon;

  if (!forretningsadresse) return null;

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

OrganisasjonsAdresse.propTypes = {
  organisasjon: MPT.Organisasjon,
};

OrganisasjonsAdresse.defaultProps = {
  organisasjon: {},
};

export default OrganisasjonsAdresse;
