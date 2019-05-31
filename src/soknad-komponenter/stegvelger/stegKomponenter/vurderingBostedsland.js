import React, { useEffect } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import * as Nav from '../../../utils/navFrontend';

import ListevelgerFlervalg from '../../../komponenter/ui/listevelgerFlervalg';
import LandVelger from '../../skjema/landvelger/';
import { BOOLSK } from '../../../constants';

import './vurderingBostedsland.css';
import * as MPT from '../../../proptypes';
import { konverterTilStegData, lagVilkaar } from '../../../regler/vilkar';
import { lagAvklartfakta, slettAvklartfakta } from '../../../regler/avklartefakta';
import * as KV from '../../../kodeverk';

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
    bekreftOgFortsett, tilstand, begrunnelser, redigerbart, oppdaterData, slettData,
  } = props;

  useEffect(() => {
    const { bosattINorgeVilkaar } = tilstand;
    oppdaterData(konverterTilStegData('bosattINorge', bosattINorgeVilkaar));

    return function cleanup() {
      slettData();
    };
  }, []);

  const {
    erBosattINorge, harAvklaring, harEOSBarnetrygdSak, begrunnelserPaaKrevd,
  } = tilstand;

  const barnetrygdTekst = harEOSBarnetrygdSak ? 'Søker har sak om EU/EØS barnetrygd fra NAV.' : 'Søker har IKKE sak om EU/EØS barnetrygd fra NAV';

  const radioEndringHandler = event => {
    oppdaterData(lagVilkaar('bosattINorge', event.target.value));
    slettData(slettAvklartfakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND));
  };

  const landEndretHandler = landKode => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, null, landKode));
  };

  return (
    <div className="vurderingBostedsland">
      <Nav.Undertittel>Vurdering av bosted</Nav.Undertittel>
      <AvklaringsListe tilstand={tilstand} />
      <div className="vurderingBostedsland__barnetrygd">{barnetrygdTekst}</div>
      <div className="vurderingBostedsland__skjemafelt">
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Fieldset legend="Bostedsland er:">
              <Nav.Radio
                name="bostedsland"
                disabled={!redigerbart}
                value={BOOLSK.SANN}
                onChange={radioEndringHandler}
                checked={erBosattINorge === BOOLSK.SANN}
                label="Norge"
              />
              <Nav.Radio
                name="bostedsland"
                disabled={!redigerbart}
                value={BOOLSK.USANN}
                onChange={radioEndringHandler}
                checked={erBosattINorge === BOOLSK.USANN}
                label="Annet"
              />
              {!erBosattINorge &&
                <LandVelger
                  disabled={!redigerbart}
                  label="Velg land:"
                  feltNavn="vurderingBostedsland.bostedsland"
                  multiland={false}
                  onChange={landEndretHandler}
                />
              }
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
        <Nav.Knapp type="hoved" disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
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
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
};

VurderingBostedsland.defaultProps = {
  tilstand: {},
  vurdering: {},
  begrunnelser: [],
};

export default VurderingBostedsland;
