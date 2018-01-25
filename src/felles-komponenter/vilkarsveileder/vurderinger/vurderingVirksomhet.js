import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingVirksomhet = props => {
  const { bekreftOgFortsett, tilstand } = props;

  const antallLand = tilstand.visAntallLand
    ?
    <Nav.Fieldset legend="Hvor mange land skal søker ha yrkesaktivitet i?">
      <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingVirksomhet.ETT_LAND_IKKE_NORGE} label="Ett land, ikke Norge" />
      <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingVirksomhet.KUN_NORGE} label="Kun Norge" />
      <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingVirksomhet.TO_ELLER_FLERE_LAND} label="To eller flere land" />
    </Nav.Fieldset>
    :
    null;

  const vekslingMellomLand = tilstand.visVekslingMellomLand
    ?
    <Nav.Fieldset legend="Veksler søker regelmessig mellom arbeid i flere land eller arbeider søker i flere land?">
      <Skjema.Radio feltNavn="faktaavklaringVekslingMellomLand" value={VurderingVirksomhet.EN_ELLER_BEGGE} label="Ja, en eller begge" />
      <Skjema.Radio feltNavn="faktaavklaringVekslingMellomLand" value={VurderingVirksomhet.INGEN_VEKSLING} label="Nei, ingen av delene" />
    </Nav.Fieldset>
    :
    null;

  const marginaltArbeid = tilstand.visMarginaltArbeid
    ?
    <Nav.Fieldset legend="Utgjør arbeidet i hvert av landene mer enn 5%? (Er det mer enn marginalt arbeid?)">
      <Skjema.Radio feltNavn="faktaavklaringMarginaltArbeid" value={VurderingVirksomhet.MARGINALT_JA} label="Ja" />
      <Skjema.Radio feltNavn="faktaavklaringMarginaltArbeid" value={VurderingVirksomhet.MARGINALT_NEI} label="Nei" />
    </Nav.Fieldset>
    :
    null;

  const aktivitetINorge = tilstand.visAktivitetINorge
    ?
    <Nav.Fieldset legend="Hvor mye av aktiviteten skjer i Norge?">
      <Skjema.Radio feltNavn="faktaavklaringAktivitetINorge" value={VurderingVirksomhet.UNDER_25_PROSENT} label="Mindre enn 25%" />
      <Skjema.Radio feltNavn="faktaavklaringAktivitetINorge" value={VurderingVirksomhet.OVER_25_PROSENT} label="25% eller mer" />
    </Nav.Fieldset>
    :
    null;

  return (
    <div>
      { antallLand }
      { vekslingMellomLand }
      { marginaltArbeid }
      { aktivitetINorge }
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Fortsett til vedtaksforslag</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVirksomhet.ID = 'VIRKSOMHET';
VurderingVirksomhet.ETT_LAND_IKKE_NORGE = 'ETT_LAND_IKKE_NORGE';
VurderingVirksomhet.KUN_NORGE = 'KUN_NORGE';
VurderingVirksomhet.TO_ELLER_FLERE_LAND = 'TO_ELLER_FLERE_LAND';
VurderingVirksomhet.EN_ELLER_BEGGE = 'EN_ELLER_BEGGE';
VurderingVirksomhet.INGEN_VEKSLING = 'INGEN_VEKSLING';
VurderingVirksomhet.MARGINALT_JA = 'MARGINALT_JA';
VurderingVirksomhet.MARGINALT_NEI = 'MARGINALT_NEI';
VurderingVirksomhet.UNDER_25_PROSENT = 'UNDER_25_PROSENT';
VurderingVirksomhet.OVER_25_PROSENT = 'OVER_25_PROSENT';

VurderingVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingVirksomhet.defaultProps = {
  tilstand: {},
};

export default VurderingVirksomhet;
