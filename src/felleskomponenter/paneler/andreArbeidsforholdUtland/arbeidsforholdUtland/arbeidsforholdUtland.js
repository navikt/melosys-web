import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';

import EnkeltArbeidsforhold from './enkeltArbeidsforhold';

import './arbeidsforholdUtland.css';

export const InnerArbeidsforholdUtland = ({
  leggTilTekst,
  slettTekst,
  redigerbart,
  fields,
}) => {
  const arbeidsforhold = fields.getAll();
  const leggTil = () => fields.push({ uuid: Utils._uuid() });
  const slett = index => fields.remove(index);
  const overordnetFeltnavn = fields.name;

  return (
    <div className="innerArbeidsforholdUtland">
      {
        arbeidsforhold.map((enkeltArbeidsforhold, index) => (
          <EnkeltArbeidsforhold
            key={Utils._uuid()}
            className="enkeltArbeidsforhold"
            redigerbart={redigerbart}
            index={index}
            slett={slett}
            overordnetFeltnavn={overordnetFeltnavn}
            slettTekst={slettTekst}
          />
        ))
      }
      <Nav.Knapp
        className="leggTilKnapp"
        disabled={!redigerbart}
        onClick={leggTil}
      >
        {leggTilTekst}
      </Nav.Knapp>
    </div>
  );
};

InnerArbeidsforholdUtland.propTypes = {
  leggTilTekst: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  fields: PT.object.isRequired,
  slettTekst: PT.string.isRequired,
};

const ArbeidsforholdUtland = ({
  feltNavn,
  ...rest
}) => (
  <FieldArray
    component={InnerArbeidsforholdUtland}
    name={feltNavn}
    props={rest}
  />
);

ArbeidsforholdUtland.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default ArbeidsforholdUtland;
