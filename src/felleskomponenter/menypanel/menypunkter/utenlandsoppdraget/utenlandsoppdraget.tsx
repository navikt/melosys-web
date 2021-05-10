import React, { ReactNode } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";

import * as Nav from "../../../../utils/navFrontend";
import * as KV from "../../../../kodeverk";

import Soknadsperiode from "./soknadsperiode";
import Soknadslandvelger from "./soknadslandvelger";
import EditerbartElement, { Status } from "../editerbartElement";
import { EditerbareUtenlandsoppdragetSporsmal, IkkeEditerbareUtenlandsoppdragetSporsmal } from "./sporsmal";
import Tittellinje from "./tittellinje";

import { behandlingsgrunnlagSelectors, behandlingsgrunnlagOperations } from "../../../../ducks/behandlingsgrunnlag";

import MKV from "../../../../melosyskodeverk";

import "./utenlandsoppdraget.css";

const { SØKNAD_FOLKETRYGDEN } = MKV.Koder.behandlingsgrunnlagtyper;

const mapStateToProps = (state: RootState) => ({
  behandlingsgrunnlagtype: behandlingsgrunnlagSelectors.BehandlingsgrunnlagtypeSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type UtenlandsoppdragetProps = PropsFromRedux & {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
  behandlingsgrunnlagEtikett: ReactNode;
};

export const Utenlandsoppdraget = ({
  visArbeidsforholdRolleEtiketter,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
  behandlingsgrunnlagEtikett,
  oppdaterBehandlingsgrunnlag,
  behandlingsgrunnlagtype,
}: UtenlandsoppdragetProps) => {
  const lagreHandler = () => {
    oppdaterBehandlingsgrunnlag();
    return true;
  };

  return (
    <div className="utenlandsoppdraget">
      <Tittellinje
        tittel={KV.Menypunkter.Utenlandsoppdraget.tittel}
        behandlingsgrunnlagEtikett={behandlingsgrunnlagEtikett}
        visArbeidsforholdRolleEtiketter={visArbeidsforholdRolleEtiketter}
      />
      <Nav.Row>
        <Nav.Column xs="6">
          <Soknadsperiode
            redigerbart={redigerbart}
            lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger}
          />
        </Nav.Column>
        {behandlingsgrunnlagtype !== SØKNAD_FOLKETRYGDEN && (
          <Nav.Column xs="6">
            <Soknadslandvelger redigerbart={redigerbart} />
          </Nav.Column>
        )}
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <EditerbartElement
            redigerbart={redigerbart}
            harData
            tittel="Tilleggsopplysninger"
            visLagreKnapp
            onLagreClick={lagreHandler}
            symbolsynlighet={{
              [Status.RedigeringUtfort]: { bin: false, pencil: true },
            }}
            redigererRender={() => <EditerbareUtenlandsoppdragetSporsmal />}
            redigeringUtfortRender={() => <IkkeEditerbareUtenlandsoppdragetSporsmal />}
          />
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

export default connector(Utenlandsoppdraget);
