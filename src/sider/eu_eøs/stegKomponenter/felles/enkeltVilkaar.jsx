import React, { useEffect } from "react";
import PT from "prop-types";
import * as Nav from "../../../../navFrontend";
import * as MPT from "../../../../proptypes";
import * as Mui from "../../../../felleskomponenter/ui";

import { konverterVilkarTilStegData, lagVilkarbegrunnelse, lagVilkaar } from "../../../../felleskomponenter/stegvelger";

const EnkeltVilkaar = (props) => {
  const { redigerbart, begrunnelser, tittel, labelOppfylt, labelIkkeOppfylt, vilkaar, vilkaarKode, oppdaterData } =
    props;

  useEffect(() => {
    oppdaterData(konverterVilkarTilStegData(vilkaarKode, vilkaar));
  }, []);

  const radioEndringHandler = (event) => {
    oppdaterData(lagVilkaar(vilkaarKode, event.target.value));
  };

  const listevalgEndringHandler = (event) => {
    oppdaterData(lagVilkarbegrunnelse(vilkaarKode, event.value));
  };

  return (
    <div className="enkeltVilkaar__skjemafelt">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Fieldset legend={tittel}>
            <Nav.Radio
              name={vilkaarKode}
              label={labelOppfylt}
              value
              checked={vilkaar.oppfylt === true}
              onChange={radioEndringHandler}
              disabled={!redigerbart}
            />
            <Nav.Radio
              name={vilkaarKode}
              label={labelIkkeOppfylt}
              value={false}
              checked={vilkaar.oppfylt === false}
              onChange={radioEndringHandler}
              disabled={!redigerbart}
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>
      {!vilkaar.oppfylt && (
        <Nav.Row>
          <Nav.Column xs="12" md="10" lg="8">
            <Nav.Fieldset legend="Begrunnelse:">
              <Mui.ListevelgerFlervalg
                muligeValg={begrunnelser}
                label="Legg til begrunnelse:"
                tillatFritekst={false}
                onChange={listevalgEndringHandler}
                defaultElementer={vilkaar.begrunnelseKoder}
                disabled={!redigerbart}
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
      )}
    </div>
  );
};

EnkeltVilkaar.propTypes = {
  redigerbart: PT.bool.isRequired,
  vilkaar: PT.object.isRequired,
  vilkaarKode: PT.string.isRequired,
  tittel: PT.string,
  labelOppfylt: PT.string.isRequired,
  labelIkkeOppfylt: PT.string.isRequired,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  oppdaterData: PT.func.isRequired,
};

EnkeltVilkaar.defaultProps = {
  begrunnelser: [],
  tittel: "",
};

export default EnkeltVilkaar;
