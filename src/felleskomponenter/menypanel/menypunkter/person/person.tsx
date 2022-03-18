import React, { ReactNode } from "react";
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
import Statsborgerskapsliste from "./statsborgerskapsliste";
import FoedestedOgLand from "./foedestedogland";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";

import "./person.css";

interface AdresseHeaderProps {
  adresseTittel: string;
}

export const AdresseHeader = ({ adresseTittel }: AdresseHeaderProps) => (
  <Nav.Row>
    <Nav.Column xs="5">
      <Nav.Typo.Element>{adresseTittel}</Nav.Typo.Element>
    </Nav.Column>
    <Nav.Column xs="3">
      <Nav.Typo.Element>Fra og med</Nav.Typo.Element>
    </Nav.Column>
    <Nav.Column xs="3">
      <Nav.Typo.Element>Til og med</Nav.Typo.Element>
    </Nav.Column>
  </Nav.Row>
);

const mapStateToProps = (state: RootState) => ({
  person: behandlingerSelectors.PersonSelector(state),
  personhistorikk: behandlingerSelectors.PersonhistorikkSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type PersonProps = PropsFromRedux & {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
  behandlingsgrunnlagEtikett: ReactNode;
  visBehandlingsgrunnlagData: boolean;
};

export const Person = ({
  redigerbart,
  person,
  visArbeidsforholdRolleEtiketter,
  behandlingsgrunnlagEtikett,
  visBehandlingsgrunnlagData,
  behandlingID,
}: PersonProps) => {
  if (Object.keys(person).length === 0) {
    return null;
  }
  return (
    <div className="person">
      <Nav.Row>
        <Nav.Column xs="12" className="etikett__container">
          <Etiketter.FraRegister />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <PersonInfo person={person} behandlingID={behandlingID} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="persontabell-row">
        <Nav.Column xs="12">
          <Mui.Undertittel ikon={Ikoner.Globe} tekst="Statsborgerskap" className="persontabell-row__tittel" />
          <Statsborgerskapsliste behandlingID={behandlingID} />
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
      {visBehandlingsgrunnlagData && (
        <>
          <Nav.Row>
            <Nav.Column className="etikett__container">
              {behandlingsgrunnlagEtikett}
              {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidstakersDel style={{ marginLeft: "0.3em" }} />}
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="9">
              <AnnenAdresse redigerbart={redigerbart} className="oppgittAdresse" />
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
};

export default connector(Person);
