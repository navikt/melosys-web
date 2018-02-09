import React from 'react';
import { reduxForm } from 'redux-form';
import PT from 'prop-types';

import * as MPT from '../proptypes/';

import Arbeidsforholdet from './arbeidsforhold/arbeidsforholdet';

import './arbeidsforholdene.css';

const uuid = require('uuid/v4');

/** Dette er grunnkomponenten som eksporteres til omverden.
 * Flertall: Arbeidsforholdene - en array med alle arbeidsforhold, hver som ett objekt.
 * Entall: Arbeidsforhold - et objekt med ett enkelt arbeidsforhold.
 *
 * @param { arbeidsforholdene } Array En liste over alle arbeidforhold, hvert som et objekt
 */
const Arbeidsforholdene = props => {
  const { arbeidsforholdene } = props;

  return (
    <div className="arbeidsforholdene">
      {arbeidsforholdene.map(arbeidsforhold => <Arbeidsforholdet
        key={uuid()}
        arbeidsforhold={arbeidsforhold}
      />)}
    </div>
  );
};

Arbeidsforholdene.propTypes = {
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  dispatch: PT.func.isRequired,
};

export default reduxForm({
  form: 'soknad',
})(Arbeidsforholdene);
