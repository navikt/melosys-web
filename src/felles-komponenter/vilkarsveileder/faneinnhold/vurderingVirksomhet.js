import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingVirksomhet = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hvor mange land skal søker arbeide/drive virsomhet i?">
        <Skjema.Radio feltNavn="faktaavklaringAntallLand" value="ETT_LAND" label="Ett" />
        <Skjema.Radio feltNavn="faktaavklaringAntallLand" value="FLERE_LAND" label="To eller flere" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Hvor mye av aktiviteten skjer i Norge?">
        <Skjema.Radio feltNavn="faktaavklaringAktivitetINorge" value="UNDER_25_PROSENT" label="Mindre enn 25%" />
        <Skjema.Radio feltNavn="faktaavklaringAktivitetINorge" value="OVER_25_PROSENT" label="25% eller mer" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Hvor mange arbeidsgivere har søker?">
        <Skjema.Radio feltNavn="faktaavklaringAntallArbeidsgivere" value="EN_ARBEIDSGIVER" label="Èn" />
        <Skjema.Radio feltNavn="faktaavklaringAntallArbeidsgivere" value="FLERE_ARBEIDSGIVERE" label="To eller fler" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Er arbeidsgivere i samme land eller i ulike land?">
        <Skjema.Radio feltNavn="faktaavklaringFordelingArbeidsgivere" value="SAMME_LAND" label="Samme land" />
        <Skjema.Radio feltNavn="faktaavklaringFordelingArbeidsgivere" value="ULIKE_LAND" label="Ulike land" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Fortsett til vilkårsforslag</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingVirksomhet;
