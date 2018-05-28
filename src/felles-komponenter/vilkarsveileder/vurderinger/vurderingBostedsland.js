import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import LandVelger from '../../skjema/landvelger/';

import './vurderingBostedsland.css';

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

ManglerInformasjon.propTypes = {
  vurderBosted: PT.func.isRequired,
};

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

class VurderingBostedsland extends Component {
  componentDidMount() {
    this.props.vurderBosted();
  }

  render () {
    const {
      bekreftOgFortsett, vurderBosted, tilstand, vurdering,
    } = this.props;
    const { visBostedslandVelger } = tilstand;
    const { form: { feilmeldinger = [] } = {} } = vurdering;

    const informasjonMangler = feilmeldinger.length > 0;

    console.log(this.props);

    return vurdering === {} ? null : (
      <div className="vurderingBostedsland">
        <div>
          <Nav.Undertittel>Bostedsvurdering</Nav.Undertittel>
          {informasjonMangler && <ManglerInformasjon vurderBosted={vurderBosted} />}
          <div className="vurderingBostedsland__skjemafelt">
            <Nav.Fieldset legend="Bostedsland er:">
              <Skjema.Radio feltNavn="faktaavklaringBostedslandSnarvei" value={VurderingBostedslandTyper.NORGE} label="Norge" disabled={informasjonMangler} />
              <Skjema.Radio feltNavn="faktaavklaringBostedslandSnarvei" value={VurderingBostedslandTyper.ANNET} label="Annet" disabled={informasjonMangler} />
              {visBostedslandVelger && <LandVelger feltNavn="faktaavklaringBostedsland" multiland={false} disabled={informasjonMangler} />}
            </Nav.Fieldset>
          </div>
        </div>
        <div className="fane__knapplinje">
          <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
  }
}

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
