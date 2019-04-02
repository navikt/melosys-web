import React from 'react';
import PT from 'prop-types';

import * as MPT from '../../proptypes';

import GeneriskAdresse from './generiskAdresse';

import './postEllerForretningsAdresse.css';

const PostEllerForretningsAdresse = ({ organisasjon, className }) => {
  const { postadresse, forretningsadresse } = organisasjon;

  if (!postadresse && !forretningsadresse) return <div>(Ingen adresse tilgjengelig)</div>;

  const adresse = postadresse || forretningsadresse;
  const tittel = postadresse ? 'Postadresse' : 'Forretningsadresse';

  return (
    <div className={className}>
      <div className="tittel">{tittel}</div>
      <GeneriskAdresse adresse={adresse} />
    </div>
  );
};

PostEllerForretningsAdresse.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  className: PT.string,
};

PostEllerForretningsAdresse.defaultProps = {
  className: '',
};

export default PostEllerForretningsAdresse;
