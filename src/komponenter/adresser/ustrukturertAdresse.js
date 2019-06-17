import React from 'react';
import PT from 'prop-types';
import uuid from 'uuid';

const UstrukturertAdresse = ({ adresse: { adresselinjer, landkode } }) => (
  <address>
    {
      adresselinjer.map(adresse => {
        if (!adresse) return null;
        return <div key={uuid()}>{adresse}</div>;
      })
    }
    {landkode}
  </address>
);

UstrukturertAdresse.propTypes = {
  adresse: PT.shape({
    adresselinjer: PT.arrayOf(PT.string),
    landkode: PT.string,
  }).isRequired,
};

export default UstrukturertAdresse;
