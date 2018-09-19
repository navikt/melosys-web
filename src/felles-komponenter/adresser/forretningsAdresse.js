import React from 'react';
import * as MPT from '../../proptypes';
import GeneriskAdresse from './generiskAdresse';

import './adresse.css';

/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const ForretningsAdresse = ({ forretningsadresse }) => (
  <GeneriskAdresse adresse={forretningsadresse} />
);

ForretningsAdresse.propTypes = {
  forretningsadresse: MPT.ForretningsAdresse,
};

ForretningsAdresse.defaultProps = {
  forretningsadresse: {},
};

export default ForretningsAdresse;
