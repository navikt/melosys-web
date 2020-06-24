import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Utils from '../../../../utils';

import LeggTilEkstraArbeidsforholdNorge from './leggTilEkstraArbeidsforholdNorge';
import Organisasjon from '../../arbeidsgiver/organisasjon';

export const InnerEkstraArbeidsforholdNorge = ({
  leggTilTekst,
  slettTekst,
  fields,
  redigerbart,
  hentOrganisasjon,
  leggTil,
  findOrganisasjon,
}) => {
  const alleEkstraArbeidsforhold = fields.getAll() || [];

  const leggTilHandler = org => {
    leggTil(fields, org);
  };

  return (
    <div className="innerEkstraArbeidsforholdNorge">
      {
        alleEkstraArbeidsforhold.map((element, indeks) => {
          const organisasjon = findOrganisasjon(element) || {};

          return (
            <Organisasjon
              key={Utils._uuid()}
              slettHandle={() => fields.remove(indeks)}
              organisasjon={organisasjon}
              redigerbart={redigerbart}
              slettTekst={slettTekst}
              visNavn
            />
          );
        })
      }
      <LeggTilEkstraArbeidsforholdNorge
        leggTil={leggTilHandler}
        leggTilTekst={leggTilTekst}
        redigerbart={redigerbart}
        hentOrganisasjon={hentOrganisasjon}
      />
    </div>
  );
};

InnerEkstraArbeidsforholdNorge.propTypes = {
  leggTilTekst: PT.string.isRequired,
  slettTekst: PT.string.isRequired,
  fields: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
  findOrganisasjon: PT.func.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  leggTil: PT.func.isRequired,
};

const EkstraArbeidsforholdNorge = ({
  leggTilTekst,
  slettTekst,
  feltNavn,
  redigerbart,
  hentOrganisasjon,
  findOrganisasjon,
  leggTil,
}) => (
  <FieldArray
    name={feltNavn}
    component={InnerEkstraArbeidsforholdNorge}
    props={{
      leggTilTekst,
      slettTekst,
      redigerbart,
      hentOrganisasjon,
      findOrganisasjon,
      leggTil,
    }}
  />
);

EkstraArbeidsforholdNorge.propTypes = {
  leggTilTekst: PT.string.isRequired,
  slettTekst: PT.string.isRequired,
  feltNavn: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  findOrganisasjon: PT.func.isRequired,
  leggTil: PT.func.isRequired,
};

export default EkstraArbeidsforholdNorge;
