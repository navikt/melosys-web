import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import classnames from 'classnames';

import * as KV from '../../../../../kodeverk';
import * as Nav from '../../../../../utils/navFrontend';
import * as Utils from '../../../../../utils';
import * as MPT from '../../../../../proptypes';

import EnkeltLandPure from '../../../../../felleskomponenter/skjema/landvelger/enkeltLandPure';
import Checkboxgruppe from '../../../../../felleskomponenter/ui/checkboxgruppe';

import { BOOLSK } from '../../../../../constants';
import {
  avklartefaktaType, lagAvklartfakta, konverterTilStegData,
  lagAvklartefaktaBegrunnelse, hentFaktaVerdi,
} from '../../../../../regler/avklartefakta';

import './vurderingBostedsland.css';

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

const VurderingBostedsland = props => {
  const {
    bekreftOgFortsett, tilstand, begrunnelser, redigerbart, oppdaterData, slettData,
  } = props;

  useEffect(() => {
    const { bostedslandFakta } = tilstand;
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, bostedslandFakta));

    return function cleanup() {
      slettData();
    };
  }, []);

  const {
    bostedslandFakta, harAvklaring, erBegrunnelserPaakrevd,
  } = tilstand;

  const erBosattINorge = () => {
    const bostedsland = hentFaktaVerdi(bostedslandFakta);
    if (Utils._isNil(bostedsland)) {
      return null;
    }
    return bostedsland === MKV.Koder.landkoder.NO;
  };

  const [erNorgeValgt, setNorgeErValgt] = useState(erBosattINorge());

  const radioEndringHandler = event => {
    if (event.target.value === 'true') {
      setNorgeErValgt(BOOLSK.SANN);
      oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, null, MKV.Koder.landkoder.NO, null));
    } else {
      setNorgeErValgt(BOOLSK.USANN);
      slettData(avklartefaktaType, KV.Koder.avklartefaktaKoder.BOSTEDSLAND);
    }
  };

  const landEndretHandler = landKode => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, null, landKode));
  };

  const begrunnelseEndret = begrunnelseKoder => {
    oppdaterData(lagAvklartefaktaBegrunnelse(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, null, begrunnelseKoder));
  };

  const eksisterendeLand = hentFaktaVerdi(bostedslandFakta) || '';

  return (
    <div className="vurderingBostedsland">
      <Nav.Undertittel>Vurdering av bosted</Nav.Undertittel>
      <div className="vurderingBostedsland__skjemafelt">
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Fieldset legend="Bostedsland er:">
              <Nav.Radio
                name="bostedsland"
                label="Norge"
                value={BOOLSK.SANN}
                onChange={radioEndringHandler}
                checked={erNorgeValgt === BOOLSK.SANN}
                disabled={!redigerbart}
              />
              <Nav.Radio
                name="bostedsland"
                label="Annet"
                value={BOOLSK.USANN}
                onChange={radioEndringHandler}
                checked={erNorgeValgt === BOOLSK.USANN}
                disabled={!redigerbart}
              />
              {eksisterendeLand !== MKV.Koder.landkoder.NO &&
              <Nav.Row>
                <Nav.Column xs="8" md="6" lg="4">
                  <EnkeltLandPure
                    label="Velg land:"
                    value={eksisterendeLand}
                    onChange={landEndretHandler}
                    landkoder={MKV.KTObjects.landkoder}
                    multiland={false}
                    disabled={!redigerbart}
                  />
                </Nav.Column>
              </Nav.Row>
              }
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
        {erBegrunnelserPaakrevd && erNorgeValgt === false && (
          <Nav.Row>
            <Nav.Column xs="6">
              <Nav.Fieldset legend="">
                <Checkboxgruppe
                  muligeValg={begrunnelser}
                  legend="Legg til begrunnelse:"
                  onChange={begrunnelseEndret}
                  defaultValg={bostedslandFakta.begrunnelseKoder}
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
