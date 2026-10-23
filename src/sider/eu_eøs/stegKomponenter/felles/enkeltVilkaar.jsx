import { useEffect } from "react";
import PT from "prop-types";
import * as Nav from "../../../../navFrontend";
import * as MPT from "../../../../proptypes";
import * as Mui from "../../../../felleskomponenter/ui";

import { konverterVilkarTilStegData, lagVilkarbegrunnelse, lagVilkaar } from "../../../../felleskomponenter/stegvelger";

function EnkeltVilkaar(props) {
  const {
    redigerbart,
    begrunnelser = [],
    tittel = "",
    labelOppfylt,
    labelIkkeOppfylt,
    vilkaar,
    vilkaarKode,
    oppdaterData,
  } = props;

  useEffect(() => {
    oppdaterData(konverterVilkarTilStegData(vilkaarKode, vilkaar));
  }, []);

  const radioEndringHandler = (value) => {
    oppdaterData(lagVilkaar(vilkaarKode, value));
  };

  const begrunnelseEndringHandler = (begrunnelseKoder) => {
    oppdaterData(lagVilkarbegrunnelse(vilkaarKode, begrunnelseKoder));
  };

  return (
    <div className="enkeltVilkaar">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.RadioGroup
            legend={tittel}
            onChange={radioEndringHandler}
            defaultValue={vilkaar.oppfylt}
            readOnly={!redigerbart}
            name={vilkaarKode}
          >
            <Nav.Radio value>{labelOppfylt}</Nav.Radio>
            <Nav.Radio value={false}>{labelIkkeOppfylt}</Nav.Radio>
          </Nav.RadioGroup>
        </Nav.Column>
      </Nav.Row>
      {vilkaar.oppfylt !== undefined && !vilkaar.oppfylt && (
        <Nav.Row>
          <Nav.Column xs="12">
            <Mui.KodeTermCheckboxGroup
              muligeValg={begrunnelser}
              legend="Legg til begrunnelse"
              onChange={begrunnelseEndringHandler}
              defaultValg={vilkaar.begrunnelseKoder}
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      )}
    </div>
  );
}

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

export default EnkeltVilkaar;
