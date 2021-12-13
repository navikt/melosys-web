import React, { useEffect } from "react";
import PT from "prop-types";

import MKV from "../../../melosyskodeverk";

import * as MPT from "../../../proptypes";
import * as Mui from "../../../felleskomponenter/ui";

import MultiVilkaar from "./felles/multiVilkaar";

const VurderingArtikkel12_1 = (props) => {
  const { bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettData, tilbake } = props;

  useEffect(
    () =>
      function cleanup() {
        slettData();
      },
    []
  );

  const { art12_1, art16_1, harAvklaring } = tilstand;

  return (
    <div>
      <MultiVilkaar
        oppdaterData={oppdaterData}
        slettData={slettData}
        redigerbart={redigerbart}
        vilkaar12={art12_1}
        vilkaarNavn12="12.1"
        vilkaarKode12="art12_1"
        begrunnelser12={MKV.KTObjects.begrunnelser.art12_1_begrunnelser}
        vilkaar16={art16_1}
      />
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};

VurderingArtikkel12_1.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  artikkel: MPT.Kodeverk,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingArtikkel12_1.defaultProps = {
  tilstand: {},
  artikkel: {},
};

export default VurderingArtikkel12_1;
