import React from 'react';
import PT from 'prop-types';
import classNames from 'classnames';

import * as MPT from '../../proptypes';
import * as Utils from '../../utils';

import GeneriskAdresse from './generiskAdresse';

import './organisasjonsAdresse.css';

const OrganisasjonsAdresse = ({
  organisasjon,
  className,
  visNavn,
  visTittel,
  boldNavn,
}) => {
  const { postadresse, forretningsadresse, navn } = organisasjon;

  if (!postadresse && !forretningsadresse) return <div>(Ingen adresse tilgjengelig)</div>;

  const visPostadresse = !Utils.adresse.erGeneriskAdresseObjektTomt(postadresse);
  const adresse = visPostadresse ? postadresse : forretningsadresse;
  const tittel = visPostadresse ? 'Postadresse' : 'Forretningsadresse';

  const cl = classNames('organisasjonsAdresse', className);
  const navnCl = classNames({
    bold: boldNavn,
  });

  return (
    <div className={cl}>
      { visNavn && <div className={navnCl}>{navn}</div>}
      { visTittel && <div className="tittel">{tittel}</div>}
      <GeneriskAdresse adresse={adresse} />
    </div>
  );
};

OrganisasjonsAdresse.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  className: PT.string,
  visNavn: PT.bool,
  visTittel: PT.bool,
  boldNavn: PT.bool,
};

OrganisasjonsAdresse.defaultProps = {
  className: '',
  visNavn: true,
  visTittel: true,
  boldNavn: false,
};

export default OrganisasjonsAdresse;
