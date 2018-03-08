import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import LandVelger from '../../skjema/landvelger/';

export const VurderingBostedslandTyper = {
  TRUE: 'true',
};

const VurderingBostedsland = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <div>
        <Nav.Normaltekst>
          Vurdering av bosted er en sammensatt vurdering. Som regel vil søker være bosatt der han har oppgitt sin adresse, men i noen tilfeller vil det være behov for nærmere undersøkelser.
          Noen indikasjoner på at det bør gjøres nærmere undersøkelser er:
        </Nav.Normaltekst>
        <ul>
          <li>Søker har d-nr.</li>
          <li>Søker har mottatt EØS-barnetrygd.</li>
          <li>Søker har oppgitt utenlandsk adresse.</li>
          <li>Mistenkelig bostedsadresse. Er den lik arbeidsgivers?</li>
          <li>Er det mange som er registrert på adressen?</li>
          <li>Søker har ikke oppgitt aktivitet i landet de har bostedsadresse.</li>
        </ul>
      </div>
      <Nav.Fieldset legend="Jeg bekrefter å ha vurdert:">
        <Skjema.Checkbox feltNavn="faktaavklaringBekrefterFamiliebosted" value={VurderingBostedslandTyper.TRUE} label="Hvor søkers nærmeste familie bor" />
        <Skjema.Checkbox feltNavn="faktaavklaringBekrefterDisponering" value={VurderingBostedslandTyper.TRUE} label="Hvor søker disponerer bolig" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Basert på dette vurderes bosted til:">
        <LandVelger feltNavn="faktaavklaringBostedsland" multiland={false} />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingBostedsland.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingBostedsland.defaultProps = {
  tilstand: {},
};

export default VurderingBostedsland;
