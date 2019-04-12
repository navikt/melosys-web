import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import ListevelgerFlervalg from '../../listevelgerFlervalg';
import LandVelger from '../../skjema/landvelger/';
import { BOOLSK } from '../../../constants';

import './vurderingBostedsland.css';
import * as MPT from '../../../proptypes';

const uuid = require('uuid/v4');

const Avklaringer = ({ avklaringer }) => (
  <div>
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
    bekreftOgFortsett, tilstand, begrunnelser, redigerbart,
  } = props;

  const {
    erBosattINorge, erAvklart, harEOSBarnetrygdSak, begrunnelserPaaKrevd,
  } = tilstand;

  const barnetrygdTekst = harEOSBarnetrygdSak ? 'Søker har sak om EU/EØS barnetrygd fra NAV.' : 'Søker har IKKE sak om EU/EØS barnetrygd fra NAV';

  return (
    <div className="vurderingBostedsland">
      <Nav.Undertittel>Vurdering av bosted</Nav.Undertittel>
      <AvklaringsListe tilstand={tilstand} />
      <div className="vurderingBostedsland__barnetrygd">{barnetrygdTekst}</div>
      <div className="vurderingBostedsland__skjemafelt">
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Fieldset legend="Bostedsland er:">
              <Skjema.Radio disabled={!redigerbart} feltNavn="vilkar.bosattINorge" value={BOOLSK.SANN} label="Norge" />
              <Skjema.Radio disabled={!redigerbart} feltNavn="vilkar.bosattINorge" value={BOOLSK.USANN} label="Annet" />
              {!erBosattINorge && <LandVelger disabled={!redigerbart} label="Velg land:" feltNavn="avklartefakta.bostedsland" multiland={false} />}
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
        {begrunnelserPaaKrevd && !erBosattINorge && (
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Begrunnelse:">
                <ListevelgerFlervalg
                  muligeValg={begrunnelser}
                  label="Legg til begrunnelse:"
                  tillatFritekst={false}
                  disabled={!redigerbart}
                />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
        )}
      </div>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" disabled={!(redigerbart && erAvklart)} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingBostedsland.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  vurdering: PT.object,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  redigerbart: PT.bool.isRequired,
};

VurderingBostedsland.defaultProps = {
  tilstand: {},
  vurdering: {},
  begrunnelser: [],
};

export default VurderingBostedsland;
