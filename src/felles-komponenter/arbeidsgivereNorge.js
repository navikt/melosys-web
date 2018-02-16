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


const ArbeidsgivereNorge = props => {
  const { arbeidsgivere } = props;

  return (
    <div className="arbeidsgivereNorge">
      {arbeidsgivere.map(arbeidsgiver => <ArbeidsgivereEnkeltNorge {...arbeidsgiver} />)}
    </div>
  );
};

ArbeidsgivereNorge.propTypes = {
  arbeidsgivere: MPT.ArbeidsgivereNorge.isRequired,
};

export default ArbeidsgivereNorge;
