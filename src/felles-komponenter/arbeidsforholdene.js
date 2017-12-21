import React, { Component } from 'react';
import { change, reduxForm } from 'redux-form';
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
class Arbeidsforholdene extends Component {
  leggtilArbeidsforholdHandler = (e, arbeidsgiverID) => {
    e.preventDefault();
    const { dispatch } = this.props;
    dispatch(change('soknad', 'utsendendeOrgnr', arbeidsgiverID));
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

export default reduxForm({
  form: 'soknad',
})(Arbeidsforholdene);
