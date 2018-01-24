import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingVirksomhet = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hvor mange land skal søker ha yrkesaktivitet i?">
        <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingVirksomhet.ETT_LAND} label="Ett land, ikke Norge" />
        <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingVirksomhet.KUN_NORGE} label="Kun Norge" />
        <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingVirksomhet.FLERE_LAND} label="To eller flere land" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Veksler søker regelmessig mellom arbeid i flere land eller arbeider søker i flere land?">
        <Skjema.Radio feltNavn="faktaavklaringVekslingMellomLand" value={VurderingVirksomhet.EN_ELLER_BEGGE} label="Ja, en eller begge" />
        <Skjema.Radio feltNavn="faktaavklaringVekslingMellomLand" value={VurderingVirksomhet.INGEN} label="Nei, ingen av delene" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Hvor mye av aktiviteten skjer i Norge?">
        <Skjema.Radio feltNavn="faktaavklaringAktivitetINorge" value={VurderingVirksomhet.UNDER_25_PROSENT} label="Mindre enn 25%" />
        <Skjema.Radio feltNavn="faktaavklaringAktivitetINorge" value={VurderingVirksomhet.OVER_25_PROSENT} label="25% eller mer" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Hvor mange arbeidsgivere har søker?">
        <Skjema.Radio feltNavn="faktaavklaringAntallArbeidsgivere" value={VurderingVirksomhet.EN_ARBEIDSGIVER} label="Èn" />
        <Skjema.Radio feltNavn="faktaavklaringAntallArbeidsgivere" value={VurderingVirksomhet.FLERE_ARBEIDSGIVERE} label="To eller fler" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Fortsett til vedtaksforslag</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVirksomhet.ID = 'VIRKSOMHET';
VurderingVirksomhet.ETT_LAND = 'ETT_LAND';
VurderingVirksomhet.KUN_NORGE = 'KUN_NORGE';
VurderingVirksomhet.FLERE_LAND = 'FLERE_LAND';
VurderingVirksomhet.UNDER_25_PROSENT = 'UNDER_25_PROSENT';
VurderingVirksomhet.OVER_25_PROSENT = 'OVER_25_PROSENT';
VurderingVirksomhet.EN_ARBEIDSGIVER = 'EN_ARBEIDSGIVER';
VurderingVirksomhet.FLERE_ARBEIDSGIVERE = 'FLERE_ARBEIDSGIVERE';
VurderingVirksomhet.EN_ELLER_BEGGE = 'SAMME_LAND';
VurderingVirksomhet.INGEN = 'INGEN';

VurderingVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingVirksomhet;
