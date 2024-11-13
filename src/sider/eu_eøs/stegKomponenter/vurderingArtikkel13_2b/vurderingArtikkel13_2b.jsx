import { useEffect, useState } from "react";
import PT from "prop-types";

import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as MPT from "../../../../proptypes";
import * as Mui from "../../../../felleskomponenter/ui";

import MKV from "../../../../melosyskodeverk";
import EnkeltLandPure from "../../../../felleskomponenter/skjema/landvelger/enkeltLandPure";
import {
  avklartefaktaType,
  lagAvklartfakta,
  konverterAvklartfaktaTilStegData,
} from "../../../../felleskomponenter/stegvelger";
import { hentFaktaVerdi } from "../../../../domeneUtils";

const radioValg = {
  NORGE: "NORGE",
  ANNET: "ANNET",
};

const VurderingArtikkel13_2b = ({
  redigerbart,
  tilstand: { omfattesILandFakta, harAvklaring },
  slettData,
  tilbake,
  oppdaterData,
  bekreftOgFortsett,
}) => {
  useEffect(() => {
    oppdaterData(konverterAvklartfaktaTilStegData(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, omfattesILandFakta));

    return () => {
      slettData();
    };
  }, []);

  const erOmfattetINorge = () => {
    const omfattetILand = hentFaktaVerdi(omfattesILandFakta);
    if (Utils._isNil(omfattetILand)) {
      return null;
    }
    return omfattetILand === MKV.Koder.landkoder.NO;
  };

  const [erNorgeValgt, setErNorgeValgt] = useState(erOmfattetINorge());

  const radioEndringHandler = (value) => {
    if (value === radioValg.NORGE) {
      setErNorgeValgt(true);
      oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, null, MKV.Koder.landkoder.NO, null));
    } else {
      setErNorgeValgt(false);
      slettData(avklartefaktaType, KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND);
    }
  };

  const landEndretHandler = (landKode) => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, null, landKode));
  };

  const valgtLand = hentFaktaVerdi(omfattesILandFakta);

  return (
    <div className="vurderingArtikkel13_2b">
      <Nav.Heading size="large" className="stegvelgertittel">
        Vurdering av artikkel 13 nr. 2 bokstav b
      </Nav.Heading>
      <Nav.RadioGroup
        legend="I hvilket land har virksomheten sitt interessesenter?"
        defaultValue={erNorgeValgt}
        name="interessesenter"
        onChange={radioEndringHandler}
        disabled={!redigerbart}
      >
        <Nav.Radio value={radioValg.NORGE}>Norge</Nav.Radio>
        <Nav.Radio value={radioValg.ANNET}>Annet</Nav.Radio>
      </Nav.RadioGroup>
      {erNorgeValgt === false && (
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
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          disabled: !redigerbart,
          onClick: tilbake,
        }}
      />
    </div>
  );
};

VurderingArtikkel13_2b.propTypes = {
  redigerbart: PT.bool.isRequired,
  tilstand: PT.shape({
    omfattesILandFakta: MPT.Avklartefakta,
    harAvklaring: PT.bool.isRequired,
  }).isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  bekreftOgFortsett: PT.func.isRequired,
};

VurderingArtikkel13_2b.defaultProps = {};

export default VurderingArtikkel13_2b;
