import { useEffect } from "react";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import { KTObject } from "@navikt/melosys-kodeverk";

import { konverterVilkarTilStegData, lagVilkarbegrunnelse, lagVilkaar } from "../../../../felleskomponenter/stegvelger";

interface Vilkaar {
  oppfylt?: boolean;
  begrunnelseKoder?: string[];
}

interface EnkeltVilkaarProps {
  redigerbart: boolean;
  vilkaar: Vilkaar;
  vilkaarKode: string;
  tittel?: string;
  labelOppfylt: string;
  labelIkkeOppfylt: string;
  begrunnelser?: KTObject[];
  oppdaterData: (data: unknown) => void;
}

function EnkeltVilkaar(props: EnkeltVilkaarProps) {
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

  const radioEndringHandler = (value: boolean) => {
    oppdaterData(lagVilkaar(vilkaarKode, value));
  };

  const begrunnelseEndringHandler = (begrunnelseKoder: string[]) => {
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

export default EnkeltVilkaar;
