import React, { useState } from "react";
import { AnyAction } from "redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { connect, ConnectedProps } from "react-redux";
import classNames from "classnames";

import MKV from "../../../melosyskodeverk";
import * as Ikon from "../../../resources/images";
import * as KV from "../../../kodeverk";

import LeggBehandlingTilbake from "./leggbehandlingtilbake";
import AvsluttSak from "./avsluttsak";
import Handling from "./handling";

import { oppgaverOperations } from "../../../ducks/oppgaver";
import { navigeringOperations } from "../../../ducks/navigering";
import { modalerOperations } from "../../../ducks/modaler";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { anmodningsperioderSelectors } from "../../../ducks/anmodningsperioder";

import "./behandlingsmeny.css";

const mapStateToProps = (state: RootState) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  behandlingsstatus: behandlingerSelectors.BehandlingsstatusKodeSelector(state),
  anmodningsperioderErSendtUtlandet: anmodningsperioderSelectors.AnmodningsperioderErSendtUtlandetSelector(state),
});
const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  tilForsiden: () => dispatch(navigeringOperations.tilForsiden()),
  tilbakeleggHandle: (oppgaveID: string, venterPaaDokumentasjon: boolean) =>
    oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
  visAvslagSoknadDialogHandle: () => dispatch(modalerOperations.visAvslagSoknad()),
  visHenleggDialogHandle: () => dispatch(modalerOperations.visHenlegg()),
  visAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.visAvsluttSakSomBortfalt()),
  visFerdigbehandleNyVurderingDialogHandle: () => dispatch(modalerOperations.visFerdigbehandleNyVurdering()),
  visRevurderFagsakDialogHandle: () => dispatch(modalerOperations.visRevurderFagsak()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const Behandlingsmeny = ({
  tilForsiden,
  tilbakeleggHandle,
  visAvslagSoknadDialogHandle,
  visHenleggDialogHandle,
  visAvsluttSakSomBortfaltDialogHandle,
  visFerdigbehandleNyVurderingDialogHandle,
  visRevurderFagsakDialogHandle,
  redigerbart,
  sakstype,
  behandlingID,
  behandlingstema,
  behandlingstype,
  behandlingsstatus,
  anmodningsperioderErSendtUtlandet,
}: PropsFromRedux) => {
  const [visBehandlingsmeny, setVisBehandlingsmeny] = useState(false);

  const behandlingskategori = KV.Utils.mapBehandlingstemaToBehandlingskategori(behandlingstema);

  const toggleBehandlingsmeny = () => setVisBehandlingsmeny(!visBehandlingsmeny);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      toggleBehandlingsmeny();
    }
  };

  const behandlingErAvsluttet = [
    MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
    MKV.Koder.behandlinger.behandlingsstatus.MIDLERTIDIG_LOVVALGSBESLUTNING,
  ].includes(behandlingsstatus);

  const behandlingstypeErEndretPeriode = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE;

  const behandlingstemaErRegistreringOmUnntakNorskTrygd = [
    MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
    MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  ].includes(behandlingstema);

  const skalViseVurderSakenPaaNytt = () => {
    switch (behandlingskategori) {
      case KV.Koder.Behandlingskategori.EØS_SAKSBEHANDLING:
        return anmodningsperioderErSendtUtlandet || (behandlingErAvsluttet && !behandlingstypeErEndretPeriode);
      case KV.Koder.Behandlingskategori.EØS_REGISTRERING:
        return behandlingErAvsluttet && behandlingstemaErRegistreringOmUnntakNorskTrygd;
      case KV.Koder.Behandlingskategori.EØS_VURDER_UTPEKING:
      case KV.Koder.Behandlingskategori.FTRL_SAKSBEHANDLING:
      case KV.Koder.Behandlingskategori.TRYGDEAVTALE_SAKSBEHANDLING:
        return behandlingErAvsluttet;
      case KV.Koder.Behandlingskategori.EØS_SED_BEHANDLING:
      default:
        return false;
    }
  };

  const knappCls = classNames("behandlingsmeny__knapp", { behandlingsmeny__knapp__aapen: visBehandlingsmeny });
  const hamburgerCls = classNames("behandlingsmeny__hamburger", {
    behandlingsmeny__hamburger__aapen: visBehandlingsmeny,
  });

  return (
    <div className="behandlingsmeny">
      <div className={knappCls} role="button" tabIndex={0} onClick={toggleBehandlingsmeny} onKeyPress={handleKeyPress}>
        <Ikon.Hamburger className={hamburgerCls} />
      </div>
      {visBehandlingsmeny && (
        <div className="behandlingsmeny__meny">
          <LeggBehandlingTilbake
            lagreOgLukkHandle={tilForsiden}
            tilbakeleggHandle={tilbakeleggHandle}
            behandlingID={behandlingID}
            redigerbart={redigerbart}
          />
          <AvsluttSak
            avslaaSoknad={visAvslagSoknadDialogHandle}
            behandlingID={behandlingID}
            henleggSak={visHenleggDialogHandle}
            avsluttSakSomBortfalt={visAvsluttSakSomBortfaltDialogHandle}
            sakstype={sakstype}
            behandlingstema={behandlingstema}
            behandlingstype={behandlingstype}
            redigerbart={redigerbart}
            ferdigbehandleNyVurdering={visFerdigbehandleNyVurderingDialogHandle}
            behandlingsstatus={behandlingsstatus}
            tilForsiden={tilForsiden}
          />
          {skalViseVurderSakenPaaNytt() && (
            <div className="behandlingsmeny__meny__handlinger">
              <Handling ikon={<Ikon.Cancel />} tekst="Vurder saken på nytt" onClick={visRevurderFagsakDialogHandle} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default connector(Behandlingsmeny);
