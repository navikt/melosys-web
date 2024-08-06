import { useEffect } from "react";
import PT from "prop-types";

import * as Nav from "../../../../navFrontend";
import * as MPT from "../../../../proptypes";
import * as Mui from "../../../../felleskomponenter/ui";

import EnkeltVilkaar from "../felles/enkeltVilkaar";

const VurderingForutgaendeMedlemskap = (props) => {
  const { bekreftOgFortsett, begrunnelser, tilstand, redigerbart, oppdaterData, slettData, tilbake } = props;
  const { harAvklaring, forutgaendeMedlemskap } = tilstand;

  useEffect(
    () =>
      function cleanup() {
        slettData();
      },
    []
  );

  return (
    <>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Forutgående medlemskap</Nav.Typo.Innholdstittel>
      <EnkeltVilkaar
        tittel="Har bruker tilstrekkelig forutgående medlemskap i folketrygden?"
        redigerbart={redigerbart}
        vilkaar={forutgaendeMedlemskap}
        vilkaarKode="forutgaendeMedlemskap"
        labelOppfylt="Ja"
        labelIkkeOppfylt="Nei"
        begrunnelser={begrunnelser}
        oppdaterData={oppdaterData}
      />
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
          "data-cy-nesteknapp": "knapp_steg5",
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </>
  );
};

VurderingForutgaendeMedlemskap.ID = "FORUTGAENDE_MEDLEMSKAP";

VurderingForutgaendeMedlemskap.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingForutgaendeMedlemskap.defaultProps = {
  tilstand: {},
  begrunnelser: [],
};

export default VurderingForutgaendeMedlemskap;
