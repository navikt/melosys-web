import { useEffect } from "react";
import PT from "prop-types";
import * as Nav from "../../../../navFrontend";
import * as MPT from "../../../../proptypes";
import * as Mui from "../../../../felleskomponenter/ui";
import EnkeltVilkaar from "../felles/enkeltVilkaar";

import { arrayTilKonjunksjon } from "../../../../utils/streng";

import "./vurderingNormaltDriverVirksomhet.css";

const NormaltDriverVirksomhet = (props) => {
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

  useEffect(
    () =>
      function cleanup() {
        slettData();
      },
    []
  );

  const { harAvklaring, normaltDriverVirksomhet } = tilstand;

  const arbeidsgivereTekst =
    valgteVirksomheter.length > 0
      ? `${arrayTilKonjunksjon(valgteVirksomheter.map((virksomhet) => virksomhet.navn))}`
      : "";

  return (
    <div className="vurderingNormaltDriverVirksomhet">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Drift i Norge</Nav.Typo.Innholdstittel>
      <EnkeltVilkaar
        oppdaterData={oppdaterData}
        labelOppfylt="Ja"
        labelIkkeOppfylt="Nei"
        begrunnelser={begrunnelser}
        redigerbart={redigerbart}
        vilkaar={normaltDriverVirksomhet}
        vilkaarKode="normaltDriverVirksomhet"
        tittel={`Driver ${arbeidsgivereTekst} vanligvis virksomhet i Norge?`}
        size="small"
      />
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !harAvklaring || !redigerbart,
          "data-cy-nesteknapp": "knapp_steg5",
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

NormaltDriverVirksomhet.ID = "NORMALT_DRIVER_VIRKSOMHET";

NormaltDriverVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteVirksomheter: PT.arrayOf(MPT.Virksomhet),
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  tilbake: PT.func.isRequired,
};

NormaltDriverVirksomhet.defaultProps = {
  tilstand: {},
  valgteVirksomheter: [],
  begrunnelser: [],
};

export default NormaltDriverVirksomhet;
