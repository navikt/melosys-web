import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

export const VurderingVirksomhetTyper = {
  ETT_LAND_IKKE_NORGE: 'ETT_LAND_IKKE_NORGE',
  KUN_NORGE: 'KUN_NORGE',
  TO_ELLER_FLERE_LAND: 'TO_ELLER_FLERE_LAND',
  EN_ELLER_BEGGE: 'EN_ELLER_BEGGE',
  INGEN_VEKSLING: 'INGEN_VEKSLING',
  MARGINALT_JA: 'MARGINALT_JA',
  MARGINALT_NEI: 'MARGINALT_NEI',
  UNDER_25_PROSENT: 'UNDER_25_PROSENT',
  OVER_25_PROSENT: 'OVER_25_PROSENT',
};

const AntallLand = () => (
  <Nav.Fieldset legend="Hvor mange land skal søker ha yrkesaktivitet i?">
    <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingVirksomhetTyper.ETT_LAND_IKKE_NORGE} label="Ett land, ikke Norge" />
    <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingVirksomhetTyper.KUN_NORGE} label="Kun Norge" />
    <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingVirksomhetTyper.TO_ELLER_FLERE_LAND} label="To eller flere land" />
  </Nav.Fieldset>
);

const VekslingMellomLand = () => (
  <Nav.Fieldset legend="Veksler søker regelmessig mellom arbeid i flere land eller arbeider søker i flere land?">
    <Skjema.Radio feltNavn="faktaavklaringVekslingMellomLand" value={VurderingVirksomhetTyper.EN_ELLER_BEGGE} label="Ja, en eller begge" />
    <Skjema.Radio feltNavn="faktaavklaringVekslingMellomLand" value={VurderingVirksomhetTyper.INGEN_VEKSLING} label="Nei, ingen av delene" />
  </Nav.Fieldset>
);

const MarginaltArbeid = () => (
  <Nav.Fieldset legend="Utgjør arbeidet i hvert av landene mer enn 5%? (Er det mer enn marginalt arbeid?)">
    <Skjema.Radio feltNavn="faktaavklaringMarginaltArbeid" value={VurderingVirksomhetTyper.MARGINALT_JA} label="Ja" />
    <Skjema.Radio feltNavn="faktaavklaringMarginaltArbeid" value={VurderingVirksomhetTyper.MARGINALT_NEI} label="Nei" />
  </Nav.Fieldset>
);

const AktivitetINorge = () => (
  <Nav.Fieldset legend="Hvor mye av aktiviteten skjer i Norge?">
    <Skjema.Radio feltNavn="faktaavklaringAktivitetINorge" value={VurderingVirksomhetTyper.UNDER_25_PROSENT} label="Mindre enn 25%" />
    <Skjema.Radio feltNavn="faktaavklaringAktivitetINorge" value={VurderingVirksomhetTyper.OVER_25_PROSENT} label="25% eller mer" />
  </Nav.Fieldset>
);

const VurderingVirksomhet = props => {
  const { bekreftOgFortsett, tilstand } = props;

  return (
    <div>
      { tilstand.visAntallLand && <AntallLand /> }
      { tilstand.visVekslingMellomLand && <VekslingMellomLand /> }
      { tilstand.visMarginaltArbeid && <MarginaltArbeid /> }
      { tilstand.visAktivitetINorge && <AktivitetINorge /> }
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Fortsett til vedtaksforslag</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVirksomhet.ID = 'VIRKSOMHET';


VurderingVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingVirksomhet.defaultProps = {
  tilstand: {},
};

export default VurderingVirksomhet;
