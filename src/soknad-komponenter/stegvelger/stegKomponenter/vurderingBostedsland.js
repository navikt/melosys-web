import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';

import ListevelgerFlervalg from '../../../komponenter/ui/listevelgerFlervalg';
import EnkeltLandPure from '../../skjema/landvelger/enkeltLandPure';
import { BOOLSK } from '../../../constants';
import * as MPT from '../../../proptypes';
import {
  avklartefaktaType, lagAvklartfakta, konverterTilStegData,
  lagAvklartefaktaBegrunnelse, hentFaktaVerdi,
} from '../../../regler/avklartefakta';

import './vurderingBostedsland.css';
import * as Utils from '../../../utils';

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

  const begrunnelseEndret = event => {
    oppdaterData(lagAvklartefaktaBegrunnelse(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, null, event.value));
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
        { erBegrunnelserPaakrevd && erNorgeValgt === false && (
          <Nav.Row>
            <Nav.Column xs="12" md="12" lg="8">
              <Nav.Fieldset legend="Begrunnelse:">
                <ListevelgerFlervalg
                  muligeValg={begrunnelser}
                  label="Legg til begrunnelse:"
                  tillatFritekst={false}
                  onChange={begrunnelseEndret}
                  defaultElementer={bostedslandFakta.begrunnelseKoder}
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
