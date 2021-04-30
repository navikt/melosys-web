import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as Nav from "../../../../utils/navFrontend";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Etiketter from "../../etiketter";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";

import "./barnetrygd.css";

const mapStateToProps = (state: RootState) => ({
  sakOgBehandling: behandlingerSelectors.SakOgBehandlingSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const Barnetrygd = ({ sakOgBehandling: { eosBarnetrygd } }: PropsFromRedux) => {
  const eosBarnetrygdString = Utils.streng.boolTilNorsk(eosBarnetrygd);
  const capitalizedEosBarneTrygd = Utils._capitalize(eosBarnetrygdString);

  return (
    <Nav.Container fluid className="barnetrygd">
      <Nav.Row className="tittel">
        <Nav.Column xs="12">
          <Nav.Typo.Innholdstittel style={{ display: "inline", marginRight: "1em" }}>
            {KV.Menypunkter.Barnetrygd.tittel}
          </Nav.Typo.Innholdstittel>
          <Etiketter.FraRegister />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Typo.Normaltekst style={{ display: "inline" }}>
            Mottar søkeren EU/EØS-barnetrygd fra NAV?
          </Nav.Typo.Normaltekst>
          <Nav.Typo.Element style={{ display: "inline", marginLeft: "1em" }}>
            {capitalizedEosBarneTrygd}
          </Nav.Typo.Element>
        </Nav.Column>
      </Nav.Row>
    </Nav.Container>
  );
};

export default connector(Barnetrygd);
