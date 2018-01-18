import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingVirksomhet = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hvor mange land skal søker arbeide/drive virksomhet i?">
        <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingVirksomhet.ETT_LAND} label="Ett" />
        <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingVirksomhet.FLERE_LAND} label="To eller flere" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Hvor mye av aktiviteten skjer i Norge?">
        <Skjema.Radio feltNavn="faktaavklaringAktivitetINorge" value={VurderingVirksomhet.UNDER_25_PROSENT} label="Mindre enn 25%" />
        <Skjema.Radio feltNavn="faktaavklaringAktivitetINorge" value={VurderingVirksomhet.OVER_25_PROSENT} label="25% eller mer" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Hvor mange arbeidsgivere har søker?">
        <Skjema.Radio feltNavn="faktaavklaringAntallArbeidsgivere" value={VurderingVirksomhet.EN_ARBEIDSGIVER} label="Èn" />
        <Skjema.Radio feltNavn="faktaavklaringAntallArbeidsgivere" value={VurderingVirksomhet.FLERE_ARBEIDSGIVERE} label="To eller fler" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Er arbeidsgivere i samme land eller i ulike land?">
        <Skjema.Radio feltNavn="faktaavklaringFordelingArbeidsgivere" value={VurderingVirksomhet.SAMME_LAND} label="Samme land" />
        <Skjema.Radio feltNavn="faktaavklaringFordelingArbeidsgivere" value={VurderingVirksomhet.ULIKE_LAND} label="Ulike land" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Fortsett til vedtaksforslag</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVirksomhet.ID = 'VIRKSOMHET';
VurderingVirksomhet.ETT_LAND = 'ETT_LAND';
VurderingVirksomhet.FLERE_LAND = 'FLERE_LAND';
VurderingVirksomhet.UNDER_25_PROSENT = 'UNDER_25_PROSENT';
VurderingVirksomhet.OVER_25_PROSENT = 'OVER_25_PROSENT';
VurderingVirksomhet.EN_ARBEIDSGIVER = 'EN_ARBEIDSGIVER';
VurderingVirksomhet.FLERE_ARBEIDSGIVERE = 'FLERE_ARBEIDSGIVERE';
VurderingVirksomhet.SAMME_LAND = 'SAMME_LAND';
VurderingVirksomhet.ULIKE_LAND = 'ULIKE_LAND';

VurderingVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingVirksomhet;
