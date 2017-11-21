import React, { Component } from 'react';
import PT from 'prop-types';
import { Field, FieldArray, reduxForm, arrayPush } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import EnkeltDato from '../../datoOmrade/enkeltDato';

import './vurderingArbeidsforhold.css';

const uuid = require('uuid/v4');

const ArbeidsforholdLinje = props => {
  const { value } = props.input;
  const { removeArbeidsforhold, arbeidsforholdene } = props;
  const arbeidsforholdet = arbeidsforholdene.find(forholdet => forholdet.arbeidsforholdID === value);

  return (
    <div className="arbeidsforhold__enkeltlinje">
      <div className="arbeidsforhold_enkeltlinje_tekst">
        <div className="arbeidsforhold__enkeltlinje__navn">{arbeidsforholdet.arbeidsgiver.navn}</div>
        <div className="arbeidsforhold__enkeltlinje__periode">
          Periode:
          <EnkeltDato dato={arbeidsforholdet.ansettelsesPeriode.fom} /> - <EnkeltDato dato={arbeidsforholdet.ansettelsesPeriode.tom} /></div>
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
        />)
      )}
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
    this.props.arbeidsforholdene.map(arbeidsforholdet => dispatch(arrayPush('vurderingArbeidsforhold', 'arbeidsforholdene', arbeidsforholdet.arbeidsforholdID)));
  }

  render () {
    const { handleSubmit, bekreftOgFortsett, arbeidsforholdene } = this.props;

    return (
      <div className="vurderingarbeidsforhold">
        <form onSubmit={handleSubmit}>
          <Nav.Undertittel>Velg relevante arbeidsforhold:</Nav.Undertittel>
          <FieldArray name="arbeidsforholdene" component={props => <Arbeidsforholdene {...props} arbeidsforholdene={arbeidsforholdene} />} />
          <div className="fane__knapplinje">
            <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
          </div>
        </form>
      </div>
    );
  }
}

VurderingArbeidsforhold.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  handleSubmit: PT.func.isRequired,
  dispatch: PT.func.isRequired,
};

export default reduxForm({
  form: 'vurderingArbeidsforhold',
})(VurderingArbeidsforhold);
