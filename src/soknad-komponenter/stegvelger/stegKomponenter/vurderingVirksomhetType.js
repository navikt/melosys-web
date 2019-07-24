import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../../komponenter/skjema';
import * as KV from '../../../kodeverk';

const VekslingMellomLand = () => (
  <Nav.Fieldset legend="Veksler søker regelmessig mellom arbeid i flere land eller arbeider søker i flere land?">
    <Skjema.Radio feltNavn="avklartefaktaVekslingMellomLand" value={KV.Koder.VurderingVirksomhetTyper.EN_ELLER_BEGGE} label="Ja, en eller begge" />
    <Skjema.Radio feltNavn="avklartefaktaVekslingMellomLand" value={KV.Koder.VurderingVirksomhetTyper.INGEN_VEKSLING} label="Nei, ingen av delene" />
  </Nav.Fieldset>
);

const MarginaltArbeid = () => (
  <Nav.Fieldset legend="Er arbeidet søker utfører som offentlig tjenesteperson for Norsk forvaltning marginalt (mindre enn 5%)?">
    <Skjema.Radio feltNavn="avklartefaktaMarginaltArbeid" value={KV.Koder.VurderingVirksomhetTyper.MARGINALT_JA} label="Ja" />
    <Skjema.Radio feltNavn="avklartefaktaMarginaltArbeid" value={KV.Koder.VurderingVirksomhetTyper.MARGINALT_NEI} label="Nei" />
  </Nav.Fieldset>
);

const AktivitetINorge = () => (
  <Nav.Fieldset legend="Hvor mye av aktiviteten skjer i Norge?">
    <Skjema.Radio feltNavn="avklartefaktaAktivitetINorge" value={KV.Koder.VurderingVirksomhetTyper.UNDER_25_PROSENT} label="Mindre enn 25%" />
    <Skjema.Radio feltNavn="avklartefaktaAktivitetINorge" value={KV.Koder.VurderingVirksomhetTyper.OVER_25_PROSENT} label="25% eller mer" />
  </Nav.Fieldset>
);

const VurderingVirksomhetType = props => {
  const { bekreftOgFortsett, tilstand } = props;

  return (
    <div>
      { tilstand.visVekslingMellomLand && <VekslingMellomLand /> }
      { tilstand.visMarginaltArbeid && <MarginaltArbeid /> }
      { tilstand.visAktivitetINorge && <AktivitetINorge /> }
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVirksomhetType.ID = 'VIRKSOMHET';


VurderingVirksomhetType.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingVirksomhetType.defaultProps = {
  tilstand: {},
};

export default VurderingVirksomhetType;
