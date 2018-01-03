import React, { Component } from 'react';
import PT from 'prop-types';
import { Field, FieldArray, reduxForm, arrayRemoveAll, arrayPush } from 'redux-form';

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
  const { arbeidsforholdet, erValgt } = props;

  return (
    <div className="arbeidsforhold__enkeltlinje">
      <Nav.Checkbox checked={erValgt} onChange={() => props.checkboxKlikkHandler(arbeidsforholdet.arbeidsforholdID)} label={`${arbeidsforholdet.arbeidsgiver.navn}`} />
      <div className="enkeltlinje__periode"><EnkeltDato dato={arbeidsforholdet.ansettelsesPeriode.fom} /> - <EnkeltDato dato={arbeidsforholdet.ansettelsesPeriode.tom} /></div>
    </div>
  );
};

ArbeidsforholdLinje.propTypes = {
  input: PT.object.isRequired,
  arbeidsforholdet: MPT.Arbeidsforhold,
  checkboxKlikkHandler: PT.func.isRequired,
  erValgt: PT.bool,
};

ArbeidsforholdLinje.defaultProps = {
  arbeidsforholdet: [],
  erValgt: false,
};

/**
 *
 * @param props Objekt Diverse props Se prop types
 * @constructor
 */
class Arbeidsforholdene extends Component {
  checkboxKlikkHandler = arbeidsforholdID => {
    const { fields, dispatch } = this.props;

    const alleOpprinneligValgte = fields.getAll();
    const alleNyeValgte = alleOpprinneligValgte.includes(arbeidsforholdID) ? alleOpprinneligValgte.filter(item => item !== arbeidsforholdID) : [...alleOpprinneligValgte, arbeidsforholdID];
    dispatch(arrayRemoveAll('soknad', 'valgteArbeidsforhold'));
    alleNyeValgte.map(valgt => (dispatch(arrayPush('soknad', 'valgteArbeidsforhold', valgt))));
  }

  render() {
    const { fields, arbeidsforholdene } = this.props;
    const valgteArbeidsforhold = fields.getAll();

    return (
      <div>
        {arbeidsforholdene.map(arbeidsforholdet => (
          <Field
            key={uuid()}
            name="valgteArbeidsforhold"
            type="text"
            component={linjeProps => <ArbeidsforholdLinje
              {...linjeProps}
              arbeidsforholdet={arbeidsforholdet}
              erValgt={valgteArbeidsforhold ? valgteArbeidsforhold.includes(arbeidsforholdet.arbeidsforholdID) : false}
              checkboxKlikkHandler={this.checkboxKlikkHandler}
            />}
          />
        ))}
      </div>
    );
  }
}

Arbeidsforholdene.propTypes = {
  fields: PT.object.isRequired,
  arbeidsforholdene: PT.array,
  dispatch: PT.func.isRequired,
};

Arbeidsforholdene.defaultProps = {
  arbeidsforholdene: [],
};

const VurderingArbeidsforhold = props => {
  const { bekreftOgFortsett, arbeidsforholdene, dispatch } = props;

  return (
    <div className="vurderingarbeidsforhold">
      <Nav.Undertittel>Velg arbeidsforhold:</Nav.Undertittel>
      <div className="arbeidsforhold">
        <FieldArray name="valgteArbeidsforhold" component={arrayProps => <Arbeidsforholdene {...arrayProps} dispatch={dispatch} arbeidsforholdene={arbeidsforholdene} />} />
        <div className="fane__knapplinje">
          <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    </div>
  );
};

VurderingArbeidsforhold.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  dispatch: PT.func.isRequired,
};

export default reduxForm({
  form: 'soknad',
})(VurderingArbeidsforhold);
