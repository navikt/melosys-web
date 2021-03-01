import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RootState } from "AppTypes";

import * as Mui from "../../../../ui";
import * as Symboler from "../../symboler";

import RedigererKomponent from "./redigerer";
import RedigeringUtfortKomponent from "./redigeringUtfort";

import { behandlingsgrunnlagOperations } from "../../../../../ducks/behandlingsgrunnlag";

import "./soknadslandvelger.css";

export enum Status {
  Redigerer,
  RedigeringUtfort,
}

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterBehandlingsgrunnlagState: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
});
const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type SoknadslandvelgerProps = PropsFromRedux & {
  redigerbart: boolean;
};

const Soknadslandvelger = ({ redigerbart /* , oppdaterBehandlingsgrunnlagState*/ }: SoknadslandvelgerProps) => {
  const [status, setStatus] = useState<Status>(Status.RedigeringUtfort);

  return (
    <div className="soknadslandvelger">
      {redigerbart && status === Status.Redigerer ? (
        <>
          <RedigererKomponent />
          <Mui.Knapp
            onClick={() => {
              setStatus(Status.RedigeringUtfort);
              // TODO: Finne ut om denne skal med
              // oppdaterBehandlingsgrunnlagState();
            }}
          >
            Lagre
          </Mui.Knapp>
        </>
      ) : (
        <div className="redigeringutfort-container">
          <RedigeringUtfortKomponent className="redigering-utfort-komponent" />
          <div className="rediger-knapp-container">
            {redigerbart && <Symboler.Rediger onClick={() => setStatus(Status.Redigerer)} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default connector(Soknadslandvelger);
