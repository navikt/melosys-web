import React from 'react';

import * as MPT from '../proptypes/';

import './arbeidsgivereNorge.css';
import Organisasjon from './arbeidsgiver/organisasjon';
import Arbeidsforholdene from './arbeidsgiver/arbeidsforhold';
import Inntekt from './arbeidsgiver/inntekt';

const uuid = require('uuid/v4');

const ArbeidsgivereEnkeltNorge = props => {
  const { organisasjon, arbeidsforholdene, inntekt } = props;

  return (
    <div>
      <Organisasjon organisasjon={organisasjon} />
      <Inntekt inntekt={inntekt} />
      <Arbeidsforholdene arbeidsforholdene={arbeidsforholdene} />
    </div>
  );
};

ArbeidsgivereEnkeltNorge.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  inntekt: MPT.Inntekt.isRequired,
};

const ArbeidsgivereNorge = props => {
  const { arbeidsgivereNorge } = props;

  return (
    <div className="arbeidsgivereNorge">
      {arbeidsgivereNorge.map(arbeidsgiver => <ArbeidsgivereEnkeltNorge key={uuid()} {...arbeidsgiver} />)}
    </div>
  );
};

ArbeidsgivereNorge.propTypes = {
  arbeidsgivereNorge: MPT.ArbeidsgivereNorge.isRequired,
};

export default ArbeidsgivereNorge;
