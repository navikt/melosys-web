import { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";

import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as Tags from "../../tags";
import * as Mui from "../../../ui";
import * as Ikoner from "../../../../resources/images";

import { Status } from "../editerbartElement";
import Redigerer from "./redigerer/redigerer";
import RedigeringUtfort from "./redigeringUtfort";

import { mottatteOpplysningerOperations } from "../../../../ducks/mottatteOpplysninger";

import "./ovrigOmArbeidstaker.css";

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterMottatteOpplysninger: () => dispatch(mottatteOpplysningerOperations.oppdaterState()),
});

const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type OvrigOmArbeidstakerProps = PropsFromRedux & {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
};

function OvrigOmArbeidstaker({
  visArbeidsforholdRolleEtiketter,
  redigerbart,
  oppdaterMottatteOpplysninger,
}: OvrigOmArbeidstakerProps) {
  const [status, setStatus] = useState<Status>(Status.RedigeringUtfort);

  const lagreHandler = () => {
    setStatus(Status.RedigeringUtfort);
    oppdaterMottatteOpplysninger();
  };

  return (
    <Nav.Container fluid className="ovrig-om-arbeidstaker">
      <Nav.Row>
        <Nav.Column xs="10" className="tittel">
          <Nav.Heading size="small">{KV.Menypunkter.OvrigOmArbeidstaker.tittel}</Nav.Heading>
          {visArbeidsforholdRolleEtiketter && <Tags.ArbeidstakersDel />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="10">
          {status === Status.RedigeringUtfort && <RedigeringUtfort />}
          {status === Status.Redigerer && <Redigerer />}
        </Nav.Column>
      </Nav.Row>
      {redigerbart && (
        <Nav.Row>
          <Nav.Column xs="9" className="rediger-lagre-knapp-container">
            {status === Status.RedigeringUtfort && (
              <Mui.Lenkeknapp ikon={Ikoner.Pencil} onClick={() => setStatus(Status.Redigerer)}>
                Rediger svar
              </Mui.Lenkeknapp>
            )}
            {status === Status.Redigerer && (
              <Nav.Button onClick={lagreHandler} disabled={!redigerbart} variant="primary">
                Lagre
              </Nav.Button>
            )}
          </Nav.Column>
        </Nav.Row>
      )}
    </Nav.Container>
  );
}

export default connector(OvrigOmArbeidstaker);
