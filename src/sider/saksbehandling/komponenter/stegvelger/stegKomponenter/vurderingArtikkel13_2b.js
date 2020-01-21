import React, { useEffect, useState } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../../utils/navFrontend';
import * as KV from '../../../../../kodeverk';
import * as Utils from '../../../../../utils';
import * as MPT from '../../../../../proptypes';

import MKV from '../../../../../melosyskodeverk';
import EnkeltLandPure from '../../../../../felleskomponenter/skjema/landvelger/enkeltLandPure';
import {
  avklartefaktaType,
  lagAvklartfakta,
  konverterTilStegData,
  hentFaktaVerdi,
} from '../../../../../regler/avklartefakta';

const radioValg = {
  NORGE: 'NORGE',
  ANNET: 'ANNET',
};

const VurderingArtikkel13_2b = ({
  redigerbart,
  tilstand: {
    interessesenterFakta,
    harAvklaring,
  },
  slettData,
  oppdaterData,
  bekreftOgFortsett,
}) => {
  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.INTERESSESENTER, interessesenterFakta));

    return () => {
      slettData();
    };
  }, []);

  const harInteressesenterINorge = () => {
    const interessesenter = hentFaktaVerdi(interessesenterFakta);
    if (Utils._isNil(interessesenter)) {
      return null;
    }
    return interessesenter === MKV.Koder.landkoder.NO;
  };

  const [erNorgeValgt, setErNorgeValgt] = useState(harInteressesenterINorge());

  const radioEndringHandler = event => {
    if (event.target.value === radioValg.NORGE) {
      setErNorgeValgt(true);
      oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.INTERESSESENTER, null, MKV.Koder.landkoder.NO, null));
    } else {
      setErNorgeValgt(false);
      slettData(avklartefaktaType, KV.Koder.avklartefaktaKoder.INTERESSESENTER);
    }
  };

  const landEndretHandler = landKode => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.INTERESSESENTER, null, landKode));
  };

  const valgtLand = hentFaktaVerdi(interessesenterFakta);

  return (
    <div>
      <Nav.typo.Undertittel>Vurdering av artikkel 13 nr. 2 bokstav b</Nav.typo.Undertittel>
      <Nav.Fieldset legend="I hvilket land har virksomheten sitt interessesenter?">
        <Nav.Radio
          name="interessesenter"
          label="Norge"
          value={radioValg.NORGE}
          onChange={radioEndringHandler}
          checked={erNorgeValgt === true}
          disabled={!redigerbart}
        />
        <Nav.Radio
          name="interessesenter"
          label="Annet"
          value={radioValg.ANNET}
          onChange={radioEndringHandler}
          checked={erNorgeValgt === false}
          disabled={!redigerbart}
        />
        {
          erNorgeValgt === false &&
          <Nav.Row>
            <Nav.Column xs="8" md="6" lg="4">
              <EnkeltLandPure
                label="Velg land:"
                value={valgtLand}
                onChange={landEndretHandler}
                landkoder={MKV.KTObjects.landkoder}
                multiland={false}
                disabled={!redigerbart}
              />
            </Nav.Column>
          </Nav.Row>
        }
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingArtikkel13_2b.propTypes = {
  redigerbart: PT.bool.isRequired,
  tilstand: PT.shape({
    interessesenterFakta: MPT.Avklartefakta,
    harAvklaring: PT.bool.isRequired,
  }).isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  bekreftOgFortsett: PT.func.isRequired,
};

VurderingArtikkel13_2b.defaultProps = {};

export default VurderingArtikkel13_2b;
