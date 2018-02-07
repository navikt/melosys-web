import React, { Component } from 'react';
import PT from 'prop-types';
import { Field, FieldArray } from 'redux-form';

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
      <Nav.Checkbox checked={erValgt} onChange={() => arbeidsforholdKlikkHandler(arbeidsforholdet.arbeidsforholdIDnav)} label={`${arbeidsforholdet.arbeidsgiver.navn}`} />
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
  arbeidsforholdKlikkHandler = arbeidsforholdIDnav => {
    const { fields } = this.props;
    const alleOpprinneligValgte = fields.getAll() || [];

    const indexPosition = alleOpprinneligValgte.findIndex(valgt => valgt === arbeidsforholdIDnav);
    return indexPosition >= 0 ? fields.remove(indexPosition) : fields.push(arbeidsforholdIDnav);
  }

  render() {
    const { fields, arbeidsforholdene } = this.props;
    const valgteArbeidsforhold = fields.getAll();

    return (
      <div>
        {arbeidsforholdene.map(arbeidsforholdet => (
          <Field
            key={uuid()}
            name="faktaavklaringValgteArbeidsforhold"
            type="text"
            component={linjeProps => <ArbeidsforholdLinje
              {...linjeProps}
              arbeidsforholdet={arbeidsforholdet}
              erValgt={valgteArbeidsforhold ? valgteArbeidsforhold.includes(arbeidsforholdet.arbeidsforholdIDnav) : false}
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
  const { bekreftOgFortsett, arbeidsforholdene } = props;

  return (
    <div className="vurderingarbeidsforhold">
      <Nav.Undertittel>Velg arbeidsforhold:</Nav.Undertittel>
      <div className="arbeidsforhold">
        <FieldArray name="faktaavklaringValgteArbeidsforhold" component={arrayProps => <ArbeidsforholdeneListe {...arrayProps} arbeidsforholdene={arbeidsforholdene} />} />
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
};

export default VurderingArbeidsforhold;
