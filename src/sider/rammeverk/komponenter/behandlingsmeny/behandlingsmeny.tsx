import React, { useState } from "react";
import { AnyAction } from "redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { connect, ConnectedProps } from "react-redux";

import * as Ikon from "../../../../resources/images";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";
import AvsluttSak from "./avsluttsak";
import Handling from "./handling";

import { oppgaverOperations } from "../../../../ducks/oppgaver";
import { navigeringOperations } from "../../../../ducks/navigering";
import { modalerOperations } from "../../../../ducks/modaler";
import { behandlingerOperations, behandlingerSelectors } from "../../../../ducks/behandlinger";

import "./behandlingsmeny.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});
const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  lagreOgLukkHandle: () => dispatch(navigeringOperations.tilForsiden()),
  tilbakeleggHandle: (oppgaveID: string, venterPaaDokumentasjon: boolean) =>
    oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
  visAvslagSoknadDialogHandle: () => dispatch(modalerOperations.visAvslagSoknad()),
  visHenleggDialogHandle: () => dispatch(modalerOperations.visHenlegg()),
  visAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.visAvsluttSakSomBortfalt()),
  apneTidligereBehandlinger: () => dispatch(behandlingerOperations.apneTidligereBehandlinger()),
  visRevurderFagsakDialogHandle: () => dispatch(modalerOperations.visRevurderFagsak()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const Behandlingsmeny = ({
  lagreOgLukkHandle,
  tilbakeleggHandle,
  visAvslagSoknadDialogHandle,
  visHenleggDialogHandle,
  visAvsluttSakSomBortfaltDialogHandle,
  apneTidligereBehandlinger,
  visRevurderFagsakDialogHandle,
  behandlingID,
}: PropsFromRedux) => {
  const [visBehandlingsmeny, setVisBehandlingsmeny] = useState(false);

  const toggleBehandlingsmeny = () => setVisBehandlingsmeny(!visBehandlingsmeny);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      toggleBehandlingsmeny();
    }
  };

  const classNameKnapp = `behandlingsmeny__knapp${visBehandlingsmeny ? " behandlingsmeny__knapp__aapen" : ""}`;
  const classNameHamburger = `hamburger${visBehandlingsmeny ? " hamburger__aapen" : ""}`;

  return (
    <div className="behandlingsmeny">
      <div
        className={classNameKnapp}
        role="button"
        tabIndex={0}
        onClick={toggleBehandlingsmeny}
        onKeyPress={handleKeyPress}
      >
        <Ikon.Hamburger className={classNameHamburger} />
      </div>
      {visBehandlingsmeny && (
        <div className="behandlingsmeny__meny">
          <LeggBehandlingTilbake
            lagreOgLukkHandle={lagreOgLukkHandle}
            tilbakeleggHandle={tilbakeleggHandle}
            behandlingID={behandlingID}
          />
          <AvsluttSak
            avslaaSoknad={visAvslagSoknadDialogHandle}
            henleggSak={visHenleggDialogHandle}
            avsluttSakSomBortfalt={visAvsluttSakSomBortfaltDialogHandle}
          />
          <div className="behandlingsmeny__meny__handlinger">
            <Handling ikon={<Ikon.Copy />} tekst="Vis saksoversikt" onClick={apneTidligereBehandlinger} />
            <Handling ikon={<Ikon.Cancel />} tekst="Vurder saken på nytt" onClick={visRevurderFagsakDialogHandle} />
          </div>
        </div>
      )}
    </div>
  );
};

export default connector(Behandlingsmeny);
