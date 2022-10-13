import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RootState } from "AppTypes";

import MKV from "../../../../../melosyskodeverk";
import * as Mui from "../../../../ui";
import * as Symboler from "../../symboler";

import { Status } from "../../editerbartElement";
import RedigererKomponent from "./redigerer";
import RedigeringUtfortKomponent from "./redigeringUtfort";

import { useFeatureToggle } from "../../../../../featuretoggle";
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../../../ducks/behandlingsgrunnlag";

import "./soknadslandvelger.css";

const mapStateToProps = (state: RootState) => ({
  behandlingHarPeriode: behandlingsgrunnlagSelectors.HarPeriodeSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterBehandlingsgrunnlagState: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type SoknadslandvelgerProps = PropsFromRedux & {
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
};

const Soknadslandvelger = ({
  redigerbart,
  oppdaterBehandlingsgrunnlagState,
  lagreSoknadOgOppfriskSaksopplysninger,
  behandlingHarPeriode,
}: SoknadslandvelgerProps) => {
  const [status, setStatus] = useState<Status>(Status.RedigeringUtfort);
  const tomLandOgPeriodeToggle = useFeatureToggle("melosys.tom_periode_og_land");
  const flytMedInngangsvilkår = window.location.pathname.indexOf(`${MKV.Koder.sakstyper.EU_EOS}/saksbehandling/`) > -1;

  const lagre = () => {
    setStatus(Status.RedigeringUtfort);
    if (tomLandOgPeriodeToggle === "enabled" && flytMedInngangsvilkår && behandlingHarPeriode) {
      lagreSoknadOgOppfriskSaksopplysninger();
    } else {
      oppdaterBehandlingsgrunnlagState();
    }
  };
  return (
    <div className="soknadslandvelger">
      {redigerbart && status === Status.Redigerer ? (
        <>
          <RedigererKomponent />
          <Mui.Knapp onClick={lagre} className="lagreknapp">
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
