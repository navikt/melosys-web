import React, { useEffect } from "react";
import PT from "prop-types";

import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as Mui from "../../../felleskomponenter/ui";

import { arrayTilKonjunksjon } from "../../../utils/streng";

import EnkeltVilkaar from "./felles/enkeltVilkaar";

const VurderingVesentligVirksomhet = (props) => {
  const {
    bekreftOgFortsett,
    begrunnelser,
    tilstand,
    redigerbart,
    oppdaterData,
    slettData,
    valgteVirksomheter,
    tilbake,
  } = props;
  const { vesentligVirksomhetVilkaar, harAvklaring } = tilstand;

  useEffect(
    () =>
      function cleanup() {
        slettData();
      },
    []
  );

  const arbeidsgivereTekst =
    valgteVirksomheter.length > 0
      ? `${arrayTilKonjunksjon(valgteVirksomheter.map((virksomhet) => virksomhet.navn))}`
      : "";

  return (
    <div>
      <Nav.Typo.Undertittel>Har {arbeidsgivereTekst} vesentlig virksomhet i Norge?</Nav.Typo.Undertittel>
      <EnkeltVilkaar
        redigerbart={redigerbart}
        begrunnelser={begrunnelser}
        vilkaar={vesentligVirksomhetVilkaar}
        vilkaarKode="vesentligVirksomhet"
        labelOppfylt="Ja"
        labelIkkeOppfylt="Nei"
        oppdaterData={oppdaterData}
      />
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          "data-cy-nesteknapp": "knapp_steg6",
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </div>
  );
};

VurderingVesentligVirksomhet.ID = "VESENTLIG_VIRKSOMHET";

VurderingVesentligVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  tilstand: PT.object,
  valgteVirksomheter: PT.arrayOf(MPT.Virksomhet),
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingVesentligVirksomhet.defaultProps = {
  tilstand: {},
  valgteVirksomheter: [],
  begrunnelser: [],
};

export default VurderingVesentligVirksomhet;
