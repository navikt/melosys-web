import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import LandVelger from '../../skjema/landvelger/';

const uuid = require('uuid/v4');

export const VurderingForretningsstedTyper = {
  ID: 'FORRETNINGSSTED',
  EN_ARBEIDSGIVER: 'EN_ARBEIDSGIVER',
  TO_ELLER_FLERE_ARBEIDSGIVERE: 'TO_ELLER_FLERE_ARBEIDSGIVERE',
  SAMME_LAND: 'SAMME_LAND',
  ULIKE_LAND: 'ULIKE_LAND',
};

const Forretningsstedet = props => {
  const { arbeidsgiver = {} } = props.forretningsstedet;
  const { navn = '' } = arbeidsgiver;

  return (
    <Nav.Fieldset legend={navn}>
      <LandVelger feltNavn="faktaavklaringForretningsstedBeslutningLand1" label="Tar viktige besluttninger i:" multiland={false} />
      <LandVelger feltNavn="faktaavklaringForretningsstedVesentligLand1" label="Har vesentlig virksomhet i:" multiland={false} />
    </Nav.Fieldset>
  );
};

Forretningsstedet.propTypes = {
  forretningsstedet: PT.object.isRequired,
};

const VurderingForretningssted = props => {
  const { bekreftOgFortsett, tilstand, valgteArbeidsforhold } = props;

  return (
    <div>
      <Nav.Undertittel>Vurder arbeidsgivers forretningssted</Nav.Undertittel>
      {
        valgteArbeidsforhold.map(forretningsstedet => <Forretningsstedet key={uuid()} forretningsstedet={forretningsstedet} />)
      }
      <Nav.Fieldset legend="Hvor mange arbeidsgivere har søker?">
        <Skjema.Radio feltNavn="faktaavklaringForretningsstedAntallArbeidsgivere" value={VurderingForretningsstedTyper.EN_ARBEIDSGIVER} label="Én" />
        <Skjema.Radio feltNavn="faktaavklaringForretningsstedAntallArbeidsgivere" value={VurderingForretningsstedTyper.TO_ELLER_FLERE_ARBEIDSGIVERE} label="To eller flere" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Er arbeidsgivere i samme land eller ulike land?">
        <Skjema.Radio feltNavn="faktaavklaringForretningsstedFordelingArbeidsgivere" value={VurderingForretningsstedTyper.SAMME_LAND} label="I samme land" />
        <Skjema.Radio feltNavn="faktaavklaringForretningsstedFordelingArbeidsgivere" value={VurderingForretningsstedTyper.ULIKE_LAND} label="I ulike land" />
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
