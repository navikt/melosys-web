import React from 'react';
import './informasjon.css';

/** Denne komponenten inneholder skjemafelter nødvendig for journalføringen
 * slik som informasjon om bruker, informasjon om dokument etc.
 * @returns {*}
 * @constructor
 */
const Informasjon = () => {
  const tekst = 'Informasjonsskjema her. Dette er en placeholdertekst.';
  return (
    <div>{tekst}</div>
  );
};

Informasjon.propTypes = {};

Informasjon.defaultProps = {};

export default Informasjon;
