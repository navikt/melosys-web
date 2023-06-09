import React, { useState } from "react";
import { AnyAction } from "redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { connect, ConnectedProps } from "react-redux";
import classNames from "classnames";

import * as Ikon from "../../../resources/images";

import LeggBehandlingTilbake from "./leggbehandlingtilbake";
import AvsluttSak from "./avsluttsak";

import { oppgaverOperations } from "../../../ducks/oppgaver";
import { navigeringOperations } from "../../../ducks/navigering";
import { modalerOperations } from "../../../ducks/modaler";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { BekreftValgTypes } from "../../../modals/bekreftValgTypes";

import "./behandlingsmeny.css";

const mapStateToProps = (state: RootState) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  sakstema: fagsakSelectors.SakstemaKodeSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
});
const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  tilForsiden: () => dispatch(navigeringOperations.tilForsiden()),
  tilbakeleggHandle: (oppgaveID: string, venterPaaDokumentasjon: boolean) =>
    oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
  visAvslagSoknadDialogHandle: () => dispatch(modalerOperations.visAvslagSoknad()),
  visHenleggDialogHandle: () => dispatch(modalerOperations.visHenlegg()),
  visBekreftValgDialogHandle: (bekreftValgType: BekreftValgTypes) =>
    dispatch(modalerOperations.visBekreftValg(bekreftValgType)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const Behandlingsmeny = ({
  tilForsiden,
  tilbakeleggHandle,
  visAvslagSoknadDialogHandle,
  visHenleggDialogHandle,
  visBekreftValgDialogHandle,
  redigerbart,
  sakstema,
  sakstype,
  behandlingID,
  behandlingstema,
  behandlingstype,
}: PropsFromRedux) => {
  const [visBehandlingsmeny, setVisBehandlingsmeny] = useState(false);

  const toggleBehandlingsmeny = () => setVisBehandlingsmeny(!visBehandlingsmeny);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      toggleBehandlingsmeny();
    }
  };

  const knappCls = classNames("behandlingsmeny__knapp", { behandlingsmeny__knapp__aapen: visBehandlingsmeny });
  const hamburgerCls = classNames("behandlingsmeny__hamburger", {
    behandlingsmeny__hamburger__aapen: visBehandlingsmeny,
  });

  return (
    <div className="behandlingsmeny">
      <div
        className={knappCls}
        role="button"
        tabIndex={0}
        onClick={toggleBehandlingsmeny}
        onKeyPress={handleKeyPress}
        aria-label="Behandlingsmeny"
        title="Behandlingsmeny"
      >
        <Ikon.Hamburger className={hamburgerCls} />
      </div>
      {visBehandlingsmeny && (
        <div className="behandlingsmeny__meny">
          <LeggBehandlingTilbake
            tilForsiden={tilForsiden}
            tilbakeleggHandle={tilbakeleggHandle}
            behandlingID={behandlingID}
            redigerbart={redigerbart}
          />
          <AvsluttSak
            avslaaSoknad={visAvslagSoknadDialogHandle}
            behandlingID={behandlingID}
            henleggSak={visHenleggDialogHandle}
            sakstema={sakstema}
            sakstype={sakstype}
            behandlingstema={behandlingstema}
            behandlingstype={behandlingstype}
            redigerbart={redigerbart}
            apneBekreftValgModal={visBekreftValgDialogHandle}
            tilForsiden={tilForsiden}
          />
        </div>
      )}
    </div>
  );
};

export default connector(Behandlingsmeny);
