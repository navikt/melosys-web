import React from 'react';
import * as MPT from '../../proptypes';
import GeneriskAdresse from './generiskAdresse';


/** Forretningsadresse formatterer adressen korrekt med sjekk på
 * varierende keys i objektet.
 *
 */
const PostAdresse = ({ postadresse }) => (
  <GeneriskAdresse adresse={postadresse} />
);

PostAdresse.propTypes = {
  postadresse: MPT.PostAdresse,
};

PostAdresse.defaultProps = {
  postadresse: {},
};

export default PostAdresse;
