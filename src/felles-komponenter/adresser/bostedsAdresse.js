import React from 'react';
import * as MPT from '../../proptypes';
import GeneriskAdresse from './generiskAdresse';


/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const BostedsAdresse = ({ bostedsadresse }) => (
  <GeneriskAdresse adresse={bostedsadresse} />
);

BostedsAdresse.propTypes = {
  bostedsadresse: MPT.BostedsAdresse,
};

BostedsAdresse.defaultProps = {
  bostedsadresse: {},
};

export default BostedsAdresse;
