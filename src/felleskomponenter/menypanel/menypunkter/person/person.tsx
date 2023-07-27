import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import * as Nav from "../../../../navFrontend";
import * as Etiketter from "../../etiketter";
import * as Mui from "../../../ui";
import * as Ikoner from "../../../../resources/images";

import PersonInfo from "./personinfo";
import Adresser from "./adresser";
import AnnenAdresse from "./annenadresse";
import UtenlandskIdent from "./utenlandskident";
import StatsborgerskapTableContainer from "./statsborgerskapTable";
import FoedestedOgLand from "./foedestedogland";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";

import "./person.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type PersonProps = PropsFromRedux & {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
  visMottatteOpplysningerData: boolean;
  endreFokus: boolean;
};

export const Person = ({
  redigerbart,
  visArbeidsforholdRolleEtiketter,
  visMottatteOpplysningerData,
  behandlingID,
  endreFokus,
}: PersonProps) => (
  <div className="person">
    <Nav.Row>
      <Nav.Column xs="12" className="etikett__container">
        <Etiketter.FraRegister />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="12">
        <PersonInfo behandlingID={behandlingID} endreFokus={endreFokus} />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row className="persontabell-row">
      <Nav.Column xs="12">
        <Mui.Undertittel ikon={Ikoner.Globe} tekst="Statsborgerskap" className="persontabell-row__tittel" />
        <StatsborgerskapTableContainer behandlingID={behandlingID} />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row className="persontabell-row">
      <Nav.Column xs="12">
        <Mui.Undertittel ikon={Ikoner.Location} tekst="Adresser" className="persontabell-row__tittel" />
      </Nav.Column>
      <Nav.Column xs="12">
        <Adresser behandlingID={behandlingID} />
      </Nav.Column>
    </Nav.Row>
    {visMottatteOpplysningerData && (
      <>
        <Nav.Row>
          <Nav.Column className="etikett__container">
            <Etiketter.FraBruker />
            {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidstakersDel style={{ marginLeft: "0.3em" }} />}
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="9">
            <AnnenAdresse className="oppgittAdresse" />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6">
            <FoedestedOgLand redigerbart={redigerbart} />
          </Nav.Column>
          <Nav.Column xs="6">
            <UtenlandskIdent redigerbart={redigerbart} />
          </Nav.Column>
        </Nav.Row>
      </>
    )}
  </div>
);

export default connector(Person);
