import React from 'react';
import PT from 'prop-types';

const StrukturertAdresse = ({
  adresse: {
    gatenavn,
    husnummer,
    region,
    postnummer,
    poststed,
    landkode,
  },
}) => (
  <address>
    <div>{gatenavn} {husnummer}</div>
    <div>{postnummer} {poststed}</div>
    <div>{region} {landkode}</div>
  </address>
);

StrukturertAdresse.propTypes = {
  adresse: PT.shape({
    gatenavn: PT.string,
    husnummer: PT.string,
    region: PT.string,
    postnummer: PT.string,
    poststed: PT.string,
    landkode: PT.string,
  }).isRequired,
};

export default StrukturertAdresse;
