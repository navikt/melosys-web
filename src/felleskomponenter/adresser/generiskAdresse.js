import React from 'react';
import * as MPT from '../../proptypes';

import * as KV from '../../kodeverk';

import './generiskAdresse.css';

/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const GeneriskAdresse = ({ adresse }) => {
  const INGEN_TILGJENGELIG_TEKST = '(ingen tilgjengelig)';
  if (!adresse) { return INGEN_TILGJENGELIG_TEKST; }

  const {
    gateadresse, land, postnr, poststed,
  } = adresse;

  const {
    gatenavn, husnummer, husbokstav,
  } = gateadresse;

  const landNavn = (typeof land === 'string' ? land : KV.objektTilTermUtenFeilmelding(land));
  const visGate = gatenavn || husnummer || husbokstav;

  return (gatenavn || husnummer || husbokstav || land || postnr || poststed) ? (
    <address className="generiskadresse">
      { visGate &&
        <div>{gatenavn} {husnummer} {husbokstav}</div>
      }
      {
        (postnr || poststed) &&
        <div>{postnr} {poststed}</div>
      }
      {
        landNavn &&
        <div>{landNavn}</div>
      }
    </address>
  ) : INGEN_TILGJENGELIG_TEKST;
};

GeneriskAdresse.propTypes = {
  adresse: MPT.GeneriskAdresse,
};

GeneriskAdresse.defaultProps = {
  adresse: {},
};

export default GeneriskAdresse;
