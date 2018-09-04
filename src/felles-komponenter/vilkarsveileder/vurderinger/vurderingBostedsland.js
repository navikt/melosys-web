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

const Avklaringer = ({ avklaringer }) => (
  <div>
    <Nav.Element>Vurder bosted manuelt:</Nav.Element>
    <ul className="betingelser__liste">
      {
        avklaringer.map(({ tekst, status }) => {
          let iconClassName;
          if (status === undefined) {
            iconClassName = 'liste__element--varsel';
          }
          const cl = classnames({ liste__element: true, [iconClassName]: true });
          return (<li key={uuid()} className={cl}>{tekst}</li>);
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
  tilstand: { avklaringer },
}) => (
  <div>
    <Avklaringer avklaringer={avklaringer} />
  </div>
);

AvklaringsListe.propTypes = {
  tilstand: PT.object.isRequired,
};

/** Hovedklasse som eksponeres ut.
 * ------------------------------
 */
const VurderingBostedsland = props => {
  const {
    bekreftOgFortsett, tilstand, vurdering,
  } = props;
  const { visBostedslandVelger, harEOSBarnetrygdSak } = tilstand;

  const barnetrygdTekst = harEOSBarnetrygdSak ? 'Søker har sak om EU/EØS barnetrygd fra NAV.' : 'Søker har IKKE sak om EU/EØS barnetrygd fra NAV';

  return vurdering === {} ? null : (
    <div className="vurderingBostedsland">
      <div>
        <Nav.Undertittel>Bostedsvurdering</Nav.Undertittel>
        <AvklaringsListe tilstand={tilstand} />
        <div className="vurderingBostedsland__barnetrygd">{barnetrygdTekst}</div>
        <div className="vurderingBostedsland__skjemafelt">
          <Nav.Fieldset legend="Bostedsland er:">
            <Skjema.Radio feltNavn="faktaavklaringBostedslandSnarvei" value={VurderingBostedslandTyper.NORGE} label="Norge" />
            <Skjema.Radio feltNavn="faktaavklaringBostedslandSnarvei" value={VurderingBostedslandTyper.ANNET} label="Annet" />
            {visBostedslandVelger && <LandVelger feltNavn="faktaavklaringBostedsland" multiland={false} />}
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
  tilstand: PT.object,
  vurdering: PT.object,
};

VurderingBostedsland.defaultProps = {
  tilstand: {},
  vurdering: {},
};

export default VurderingBostedsland;
