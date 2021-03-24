import React, { ReactNode } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";

import * as Nav from "../../../../utils/navFrontend";
import * as Etiketter from "../../etiketter";
import * as KV from "../../../../kodeverk";

import Soknadsperiode from "./soknadsperiode";
import Soknadslandvelger from "./soknadslandvelger";
import EditerbartElement, { Status } from "../editerbartElement";
import { EditerbareUtenlandsoppdragetSporsmal, IkkeEditerbareUtenlandsoppdragetSporsmal } from "./sporsmal";

import { behandlingsgrunnlagOperations } from "../../../../ducks/behandlingsgrunnlag";

import "./utenlandsoppdraget.css";

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
});

const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type UtenlandsoppdragetProps = PropsFromRedux & {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
  behandlingsgrunnlagEtikett: ReactNode;
};

const Utenlandsoppdraget = ({
  visArbeidsforholdRolleEtiketter,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
  behandlingsgrunnlagEtikett,
  oppdaterBehandlingsgrunnlag,
}: UtenlandsoppdragetProps) => {
  const lagreHandler = () => {
    oppdaterBehandlingsgrunnlag();
    return true;
  };

  return (
    <div className="utenlandsoppdraget">
      <div style={{ marginBottom: "1em" }}>
        <Nav.typo.Innholdstittel style={{ display: "inline", marginRight: "1em" }}>
          {KV.Menypunkter.Utenlandsoppdraget.tittel}
        </Nav.typo.Innholdstittel>
        <span>{behandlingsgrunnlagEtikett}</span>
        {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
      </div>
      <Nav.Row>
        <Nav.Column xs="6">
          <Soknadsperiode
            redigerbart={redigerbart}
            lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger}
          />
        </Nav.Column>
        <Nav.Column xs="6">
          <Soknadslandvelger redigerbart={redigerbart} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <EditerbartElement
            redigerbart={redigerbart}
            harData
            tittel="Tilleggsopplysninger"
            hentNyStatusVedHarDataEndring={false}
            visLagreKnapp
            onLagreClick={lagreHandler}
            symbolsynlighetMap={new Map([[Status.RedigeringUtfort, { bin: false, pencil: true }]])}
            redigererRender={() => <EditerbareUtenlandsoppdragetSporsmal redigerbart={redigerbart} />}
            redigeringUtfortRender={() => <IkkeEditerbareUtenlandsoppdragetSporsmal />}
          />
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

export default connector(Utenlandsoppdraget);
