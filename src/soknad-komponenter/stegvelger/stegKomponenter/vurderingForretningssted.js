import React from 'react';
import PT from 'prop-types';
import { FieldArray, Field } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as KV from '../../../kodeverk';

import LandVelger from '../../skjema/landvelger/';

const uuid = require('uuid/v4');

/** Det gir ingen mening å legge inn input=hidden i Redux Form, men vi trenger allikevel å knytte et felt
 * med arbeidsgiverID til hver gruppe av svar slik at vi vet hvilken arbeidsgiverID som saksbehandler har gitt vilke svar til.
 * Løsningen på dette ble å lage en egen custom component som ikke returnerer noe synlig felt, men som umiddelbart
 * ved mount lagrer arbeidsgiverID (onChange) til sitt tilhørende object i den tilhørende form field arrayen.
 * @param props
 * @returns {*}
 * @constructor
 */
const ArbeidsgiverIDField = props => {
  props.input.onChange(props.arbeidsgiverID);
  return (<div />);
};

ArbeidsgiverIDField.propTypes = {
  input: PT.object.isRequired,
  arbeidsgiverID: PT.string.isRequired,
};

/** Dette er enkeltkomponenten for hver gruppe av valgte arbeidsforhold. Komponenten itereres av Forretningssteder
 * slik at alle valgte arbeidsgivere blir listet, uavhengig av om saksbehandler har besvart spørsmålene eller ikke.
 *
 * @param props
 * @returns {Object}
 */
const Forretningsstedet = props => {
  const { index } = props;
  const { arbeidsgiver, arbeidsgiverID } = props.forretningsstedet;
  if (!arbeidsgiver) return null;

  const { navn = '' } = arbeidsgiver;

  return (
    <Nav.Fieldset legend={navn}>
      <Field name={`avklartefaktaForretningsstedLand[${index}].arbeidsgiverID`} value={arbeidsgiverID} component={ArbeidsgiverIDField} arbeidsgiverID={arbeidsgiverID} />
      <LandVelger feltNavn={`avklartefaktaForretningsstedLand[${index}].beslutninger`} label="Tar viktige beslutninger i:" multiland={false} />
      <LandVelger feltNavn={`avklartefaktaForretningsstedLand[${index}].virksomhet`} label="Har vesentlig virksomhet i:" multiland={false} />
    </Nav.Fieldset>
  );
};

Forretningsstedet.propTypes = {
  forretningsstedet: PT.object.isRequired,
  index: PT.number.isRequired,
};

/** Dette er komponenten som benyttes av FieldArray og som gjør at felter for hver valgte arbeidsforhold kan
 * legges inn som array og underliggende felter kan fylles ut. Merk at istedet for å loope igjennom ArrayField for å finne
 * alle felter (slik man vanligvis ville ha gjort) looper denne komponenten igjennom 'valgteArbeidsforhold'-arrayen
 * som består av alle arbeidsgiverID'er som saksbehandleren har valgt i tidligere steg.
 *
 * @param props
 * @returns {Object}
 */
const Forretningssteder = props => {
  const { valgteArbeidsforhold } = props;
  return (
    <div>
      {
        valgteArbeidsforhold.map((forretningsstedet, index) => <Forretningsstedet key={uuid()} forretningsstedet={forretningsstedet} index={index} {...props} />)
      }
    </div>
  );
};

Forretningssteder.propTypes = {
  valgteArbeidsforhold: PT.array.isRequired,
};

/** Hovedkomponenten som rigges opp mot stegvelgeren.
 *
 * @param props
 * @returns {Object}
 */
const VurderingForretningssted = props => {
  const { bekreftOgFortsett, valgteArbeidsforhold } = props;

  return (
    <div>
      <Nav.Undertittel>Vurder arbeidsgivers forretningssted</Nav.Undertittel>
      <FieldArray name="avklartefaktaForretningsstedLand" component={Forretningssteder} valgteArbeidsforhold={valgteArbeidsforhold} />
      <Nav.Fieldset legend="Hvor mange arbeidsgivere har søker?">
        <Skjema.Radio feltNavn="avklartefaktaForretningsstedAntallArbeidsgivere" value={KV.Koder.VurderingForretningsstedTyper.EN_ARBEIDSGIVER} label="Én" />
        <Skjema.Radio feltNavn="avklartefaktaForretningsstedAntallArbeidsgivere" value={KV.Koder.VurderingForretningsstedTyper.TO_ELLER_FLERE_ARBEIDSGIVERE} label="To eller flere" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Er arbeidsgivere i samme land eller ulike land?">
        <Skjema.Radio feltNavn="avklartefaktaForretningsstedFordelingArbeidsgivere" value={KV.Koder.VurderingForretningsstedTyper.SAMME_LAND} label="I samme land" />
        <Skjema.Radio feltNavn="avklartefaktaForretningsstedFordelingArbeidsgivere" value={KV.Koder.VurderingForretningsstedTyper.ULIKE_LAND} label="I ulike land" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingForretningssted.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteArbeidsforhold: PT.array,
};

VurderingForretningssted.defaultProps = {
  tilstand: {},
  valgteArbeidsforhold: [],
};

export default VurderingForretningssted;
