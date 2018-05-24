import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import LandVelger from '../../skjema/landvelger/';

export const VurderingBostedslandTyper = {
  NORGE: 'NORGE',
  ANNET: 'ANNET',
};

const TipsBostedsvurderingYrkesaktiv = () => (
  <ul>
    <li>Sjekk om søker har aktivitet i Norge</li>
    <li>Sjekk bostedsadressen er troverdig</li>
    <li>Sjekk om ektefelle har ekte fødselsnummer eller d-nummer</li>
    <li>Sjekk opplysninger om EØS-barnetrygd i Gosys</li>
  </ul>
);

const TipsBostedsvurderingIkkeYrkesaktiv = () => (
  <ul>
    <li>Sjekk bostedsadressen er troverdig</li>
    <li>Sjekk om ektefelle har ekte fødselsnummer eller d-nummer</li>
    <li>Sjekk opplysninger om EØS-barnetrygd i Gosys</li>
  </ul>
);

const Avklaringer = ({ avklaringer }) => (
  <div>
    <Nav.Element>Vurder bosted manuelt. Systemet har avklart at søker har følgende:</Nav.Element>
    <ul className="betingelser__liste">
      <li className="liste__element liste__element--oppfylt">Fødselsnummer</li>
      <li className="liste__element liste__element--oppfylt">Adresse i Norge</li>
      <li className="liste__element liste__element--oppfylt">Familie i Norge</li>
      <li className="liste__element liste__element--varsel">EØS barnetrygd</li>
      <li className="liste__element liste__element--varsel">Flere enn 10 bostatt på adressen sin</li>
    </ul>
  </div>
);

const ManglerInformasjon = ({ vurderBosted }) => (
  <div>
    <p>
      Vennligst fyll ut panelet &quot;opplysninger om bosted&quot; med informasjon fra søknaden.
    </p>
    <Nav.Hovedknapp onClick={vurderBosted}>Vurder bosted</Nav.Hovedknapp>
  </div>
);

const VurderingErGjort = ({
  tilstand: { visTipsForYrkesaktiv, visTipsForIkkeYrkesaktiv },
  vurderinger: { avklaringer },
}) => (
  <div>
    {Object.keys(avklaringer).length > 0 && <Avklaringer avklaringer={avklaringer} />}

    <Nav.Element>Tips for manuell bostedsvurdering:</Nav.Element>
    {visTipsForYrkesaktiv && <TipsBostedsvurderingYrkesaktiv />}
    {visTipsForIkkeYrkesaktiv && <TipsBostedsvurderingIkkeYrkesaktiv />}
  </div>
);

VurderingErGjort.propTypes = {
  tilstand: PT.object.isRequired,
  vurderinger: PT.object.isRequired,
};

const VurderingBostedsland = props => {
  const { bekreftOgFortsett, tilstand, vurdering } = props;
  const { visBostedslandVelger } = tilstand;
  const { feilmeldinger = [] } = vurdering.form;

  const felterMangler = feilmeldinger.length > 0;

  return (
    <div>
      <div>
        <Nav.Undertittel>Bostedsvurdering</Nav.Undertittel>

      </div>
      <Nav.Fieldset legend="Bostedsland er:">
        <Skjema.Radio feltNavn="faktaavklaringBostedslandSnarvei" value={VurderingBostedslandTyper.NORGE} label="Norge" />
        <Skjema.Radio feltNavn="faktaavklaringBostedslandSnarvei" value={VurderingBostedslandTyper.ANNET} label="Annet" />
        {visBostedslandVelger && <LandVelger feltNavn="faktaavklaringBostedsland" multiland={false} />}
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingBostedsland.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  vurderBosted: PT.func.isRequired,
  tilstand: PT.object,
  vurdering: PT.object,
};

VurderingBostedsland.defaultProps = {
  tilstand: {},
  vurdering: {},
};

export default VurderingBostedsland;
