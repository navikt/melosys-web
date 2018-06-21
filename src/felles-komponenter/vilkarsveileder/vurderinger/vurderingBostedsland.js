import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import LandVelger from '../../skjema/landvelger/';

import './vurderingBostedsland.css';

const uuid = require('uuid/v4');

export const VurderingBostedslandTyper = {
  NORGE: 'NORGE',
  ANNET: 'ANNET',
};

/** Vises dersom det mangler informasjon som saksbehandler må fylle inn.
 */
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
      {
        avklaringer.map(({ term, status }) => {
          const cl = classnames({ liste__element: true, 'liste__element--oppfylt': status, 'liste__element--varsel': !status });
          return (<li key={uuid()} className={cl}>{term}</li>);
        })
      }
    </ul>
  </div>
);

Avklaringer.propTypes = {
  avklaringer: PT.array,
};

Avklaringer.defaultProps = {
  avklaringer: [],
};


/** Vises dersom API returnerte en liste over avklaringer, dvs at ingen
 * informasjon mangler.
 */
const AvklaringsListe = ({
  tilstand: { visTipsForYrkesaktiv, visTipsForIkkeYrkesaktiv },
  avklaringer,
}) => (
  <div>
    {Object.keys(avklaringer).length > 0 && <Avklaringer avklaringer={avklaringer} />}

    <Nav.Element>Tips for manuell bostedsvurdering:</Nav.Element>
    {visTipsForYrkesaktiv && <TipsBostedsvurderingYrkesaktiv />}
    {visTipsForIkkeYrkesaktiv && <TipsBostedsvurderingIkkeYrkesaktiv />}
  </div>
);

AvklaringsListe.propTypes = {
  tilstand: PT.object.isRequired,
  avklaringer: PT.array.isRequired,
};

/** Hovedklasse som eksponeres ut.
 * ------------------------------
 */
const VurderingBostedsland = () => {
  const {
    bekreftOgFortsett, tilstand, vurdering,
  } = this.props;
  const { visBostedslandVelger } = tilstand;
  const { form: { feilmeldinger = [] } = {}, avklaringer = {} } = vurdering;

  const informasjonMangler = feilmeldinger.length > 0;

  return vurdering === {} ? null : (
    <div className="vurderingBostedsland">
      <div>
        <Nav.Undertittel>Bostedsvurdering</Nav.Undertittel>
        <AvklaringsListe tilstand={tilstand} avklaringer={avklaringer} />
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
