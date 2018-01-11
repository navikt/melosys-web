import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingVirksomhet = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hvor mange land skal søker arbeide/drive virsomhet i?">
        <Skjema.Radio feltNavn="faktaavklaringAntallLand" value="ettLand" label="Ett" />
        <Skjema.Radio feltNavn="faktaavklaringAntallLand" value="flereLand" label="To eller flere" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Hvor mye av aktiviteten skjer i Norge?">
        <Skjema.Radio feltNavn="faktaavklaringAktivitet" value="aktivitetUnder25" label="Mindre enn 25%" />
        <Skjema.Radio feltNavn="faktaavklaringAktivitet" value="aktivitetOver25" label="25% eller mer" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Hvor mange arbeidsgivere har søker?">
        <Skjema.Radio feltNavn="faktaavklaringAntallArbeidsgivere" value="arbeidsgiverEn" label="Èn" />
        <Skjema.Radio feltNavn="faktaavklaringAntallArbeidsgivere" value="arbeidsgiverToEllerFlere" label="To eller fler" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Er arbeidsgivere i samme land eller i ulike land?">
        <Skjema.Radio feltNavn="faktaavklaringArbeidsgiverLand" value="arbeidsgiverSammeLand" label="Samme land" />
        <Skjema.Radio feltNavn="faktaavklaringArbeidsgiverLand" value="arbeidsgiverUlikeLand" label="Ulike land" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingVirksomhet;
