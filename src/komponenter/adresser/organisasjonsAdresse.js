import React from 'react';
import PT from 'prop-types';

import * as MPT from '../../proptypes';

import GeneriskAdresse from './generiskAdresse';

import './organisasjonsAdresse.css';

const OrganisasjonsAdresse = ({ organisasjon, className, visNavn }) => {
  const { postadresse, forretningsadresse, navn } = organisasjon;

  if (!postadresse && !forretningsadresse) return <div>(Ingen adresse tilgjengelig)</div>;

  const adresse = postadresse || forretningsadresse;
  const tittel = postadresse ? 'Postadresse' : 'Forretningsadresse';

  return (
    <div className={className}>
      { visNavn && <div>{navn}</div>}
      <div className="tittel">{tittel}</div>
      <GeneriskAdresse adresse={adresse} />
    </div>
  );
};

OrganisasjonsAdresse.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  className: PT.string,
  visNavn: PT.bool,
};

OrganisasjonsAdresse.defaultProps = {
  className: '',
  visNavn: true,
};

export default OrganisasjonsAdresse;
