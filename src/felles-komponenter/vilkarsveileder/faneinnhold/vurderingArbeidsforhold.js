import React, { Component } from 'react';
import PT from 'prop-types';
import { Field, FieldArray, reduxForm, arrayRemoveAll, arrayPush } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import EnkeltDato from '../../datoOmrade/enkeltDato';

import './vurderingArbeidsforhold.css';

const uuid = require('uuid/v4');

/**
 * Enkeltsjekkboks for ett arbeidsforhold. Perioden er lagt inn slik at
 * saksbehandler lettere kan differiensiere mellom like arbeidsforhold.
 *
 * @param props Objekt Diverse props (se propTypes)
 */
const ArbeidsforholdLinje = props => {
  const { arbeidsforholdet, erValgt, arbeidsforholdKlikkHandler } = props;

  return (
    <div className="arbeidsforhold__enkeltlinje">
      <Nav.Checkbox checked={erValgt} onChange={() => arbeidsforholdKlikkHandler(arbeidsforholdet.arbeidsforholdID)} label={`${arbeidsforholdet.arbeidsgiver.navn}`} />
      <div className="enkeltlinje__periode"><EnkeltDato dato={arbeidsforholdet.ansettelsesPeriode.fom} /> - <EnkeltDato dato={arbeidsforholdet.ansettelsesPeriode.tom} /></div>
    </div>
  );
};

ArbeidsforholdLinje.propTypes = {
  input: PT.object.isRequired,
  arbeidsforholdet: MPT.Arbeidsforhold,
  arbeidsforholdKlikkHandler: PT.func.isRequired,
  erValgt: PT.bool,
};

ArbeidsforholdLinje.defaultProps = {
  arbeidsforholdet: [],
  erValgt: false,
};

/**
 * FieldArray trenger en egen komponent-container for å rendre ut hvert enkelt felt som er lagret i store (dvs avkryssede arbeidsforhold).
 * Rendre ut ALLE arbeidsforhold og kryss av de som samsvarer med arbeidsforholdID.
 *
 * Komponenten har er stateful fordi vi trenger å lese fields-objektet (som er et ArrayField i redux form, "valgteArbeidsforhold").
 * Det gir mest mening å la denne listekomponenten håndtere klikk-events selv.
 *
 * @param props Objekt Diverse props Se prop types
 */
class ArbeidsforholdeneListe extends Component {
  arbeidsforholdKlikkHandler = arbeidsforholdID => {
    const { fields, dispatch } = this.props;
    const alleOpprinneligValgte = fields.getAll();
    const alleNyeValgte = alleOpprinneligValgte.includes(arbeidsforholdID)
      ?
      alleOpprinneligValgte.filter(item => item !== arbeidsforholdID)
      :
      [...alleOpprinneligValgte, arbeidsforholdID];

    dispatch(arrayRemoveAll('soknad', 'valgteArbeidsforhold'));

    // Finnes p.t. ingen måte å pushe en hel Array, så hver verdi må pushes én og én. Dette er også anbefalt av erikras.
    alleNyeValgte.forEach(valgt => (dispatch(arrayPush('soknad', 'valgteArbeidsforhold', valgt))));
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
              arbeidsforholdKlikkHandler={this.arbeidsforholdKlikkHandler}
            />}
          />
        ))}
      </div>
    );
  }
}

ArbeidsforholdeneListe.propTypes = {
  fields: PT.object.isRequired,
  arbeidsforholdene: PT.array,
  dispatch: PT.func.isRequired,
};

ArbeidsforholdeneListe.defaultProps = {
  arbeidsforholdene: [],
};

/**
 * Dette er hovedkomponenten for fanen "Velg Arbeidsforhold". Denne trekker innn ArbeidsforholdListe som er den egentlige utlistingen av sjekkbokser og håndtereren
 * av event handlers hvor bruker velger et arbeidsforhold.
 *
 * @param props
 */
const VurderingArbeidsforhold = props => {
  const { bekreftOgFortsett, arbeidsforholdene, dispatch } = props;

  return (
    <div className="vurderingarbeidsforhold">
      <Nav.Undertittel>Velg arbeidsforhold:</Nav.Undertittel>
      <div className="arbeidsforhold">
        <FieldArray name="valgteArbeidsforhold" component={arrayProps => <ArbeidsforholdeneListe {...arrayProps} dispatch={dispatch} arbeidsforholdene={arbeidsforholdene} />} />
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
