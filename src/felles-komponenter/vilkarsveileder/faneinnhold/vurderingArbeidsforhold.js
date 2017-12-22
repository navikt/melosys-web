import React, { Component } from 'react';
import PT from 'prop-types';
import { Field, FieldArray, reduxForm, initialize } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import EnkeltDato from '../../datoOmrade/enkeltDato';

import './vurderingArbeidsforhold.css';

const uuid = require('uuid/v4');

/** Ekeltlinje for arbeidsforholdet som saksbehandleren har valgt
 *
 * @param props Objekt Diverse props (se propTypes)
 * @constructor
 */
const ArbeidsforholdLinje = props => {
  const { value } = props.input;
  const { removeArbeidsforhold, arbeidsforholdene } = props;
  const arbeidsforholdet = arbeidsforholdene.find(forholdet => forholdet.arbeidsforholdID === value);

  return (
    <div className="arbeidsforhold__enkeltlinje">
      <div className="arbeidsforhold_enkeltlinje_tekst">
        <div className="arbeidsforhold__enkeltlinje__navn">{arbeidsforholdet.arbeidsgiver.navn}</div>
        <div className="arbeidsforhold__enkeltlinje__periode">
          Periode: <EnkeltDato dato={arbeidsforholdet.ansettelsesPeriode.fom} /> - <EnkeltDato dato={arbeidsforholdet.ansettelsesPeriode.tom} />
        </div>
      </div>
      <button className="arbeidsforhold__enkeltlinje__knapp" onClick={() => removeArbeidsforhold()}>-</button>
    </div>
  );
};

ArbeidsforholdLinje.propTypes = {
  removeArbeidsforhold: PT.func.isRequired,
  input: PT.object.isRequired,
  arbeidsforholdene: PT.array,
};

ArbeidsforholdLinje.defaultProps = {
  arbeidsforholdene: [],
};

/**
 *
 * @param props Objekt Diverse props Se prop types
 * @constructor
 */
const Arbeidsforholdene = props => {
  const { fields: valgteArbeidsforhold, arbeidsforholdene } = props;
  return (
    <div>
      {valgteArbeidsforhold.map((arbeidsforhold, index) => (
        <Field
          key={uuid()}
          name={`${arbeidsforhold}`}
          type="text"
          component={linjeProps => <ArbeidsforholdLinje {...linjeProps} arbeidsforholdene={arbeidsforholdene} />}
          removeArbeidsforhold={() => valgteArbeidsforhold.remove(index)}
        />
      ))}
    </div>
  );
};

Arbeidsforholdene.propTypes = {
  fields: PT.object.isRequired,
  arbeidsforholdene: PT.array,
};

Arbeidsforholdene.defaultProps = {
  arbeidsforholdene: [],
};

class VurderingArbeidsforhold extends Component {
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(initialize('vurderingArbeidsforhold', {
      arbeidsforholdene: this.props.arbeidsforholdene.map(arbeidsforholdet => arbeidsforholdet.arbeidsforholdID),
    }));
  }

  render () {
    const { bekreftOgFortsett, arbeidsforholdene } = this.props;

    return (
      <div className="vurderingarbeidsforhold">
        <Nav.Undertittel>Velg relevante arbeidsforhold:</Nav.Undertittel>
        <div className="arbeidsforhold">
          <FieldArray name="arbeidsforholdene" component={props => <Arbeidsforholdene {...props} arbeidsforholdene={arbeidsforholdene} />} />
          <div className="fane__knapplinje">
            <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
          </div>
        </div>
      </div>
    );
  }
}

VurderingArbeidsforhold.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  dispatch: PT.func.isRequired,
};

export default reduxForm({
  form: 'soknad',
})(VurderingArbeidsforhold);
