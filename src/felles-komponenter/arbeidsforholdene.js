import React, { Component } from 'react';
import { arrayPush } from 'redux-form';
import { validForm, rules } from 'react-redux-form-validation';
import PT from 'prop-types';

import * as MPT from '../proptypes/';

import Arbeidsforholdet from './arbeidsforholdet';

import './arbeidsforholdene.css';

const uuid = require('uuid/v4');

/** Dette er grunnkomponenten som eksporteres til omverden.
 * Flertall: Arbeidsforholdene - en array med alle arbeidsforhold, hver som ett objekt.
 * Entall: Arbeidsforhold - et objekt med ett enkelt arbeidsforhold.
 *
 * @param { arbeidsforholdene } Array En liste over alle arbeidforhold, hvert som et objekt
 */
class Arbeidsforholdene extends Component {
  leggtilArbeidsforholdHandler = arbeidsforholdID => {
    const { dispatch } = this.props;
    dispatch(arrayPush('vurderingArbeidsforhold', 'arbeidsforholdene', arbeidsforholdID));
  }

  render () {
    const { arbeidsforholdene } = this.props;
    const { leggtilArbeidsforholdHandler } = this;

    return (
      <div className="arbeidsforholdene">
        {arbeidsforholdene.map(arbeidsforhold => <Arbeidsforholdet
          key={uuid()}
          arbeidsforhold={arbeidsforhold}
          leggtilArbeidsforhold={leggtilArbeidsforholdHandler}
        />)}
      </div>
    );
  }
}

Arbeidsforholdene.propTypes = {
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  dispatch: PT.func.isRequired,
};

export default validForm({
  form: 'vurderingArbeidsforhold',
  validate: {
    arbeidsforholdene: [rules.required],
  },
})(Arbeidsforholdene);
