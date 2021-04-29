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

import { behandlingsgrunnlagOperations } from "../../../../ducks/behandlingsgrunnlag";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";

import MKV from "../../../../melosyskodeverk";

import "./utenlandsoppdraget.css";

const mapStateToProps = (state: RootState) => ({
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
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
  behandlingstema,
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
        {behandlingstema !== MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET && (
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
            hentNyStatusVedHarDataEndring={false}
            visLagreKnapp
            onLagreClick={lagreHandler}
            symbolsynlighetMap={new Map([[Status.RedigeringUtfort, { bin: false, pencil: true }]])}
            redigererRender={() => <EditerbareUtenlandsoppdragetSporsmal />}
            redigeringUtfortRender={() => <IkkeEditerbareUtenlandsoppdragetSporsmal />}
          />
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

export default connector(Utenlandsoppdraget);
