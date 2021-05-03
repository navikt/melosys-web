import React from "react";
import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../utils/navFrontend";
import "./behandlingsmeny.css";

interface Props {
  redigerbart: boolean;
  behandlingstype: string;
  anmodningsperioderErSendtUtlandet: boolean;

  lagreOgLukkHandle: () => void;
  tilbakeleggeHandle: () => void;
  oppfriskSaksopplysningerHandle: () => void;
  visHenleggDialogHandle: () => void;
  visAvsluttSakSomBortfaltDialogHandle: () => void;
  visAvslagSoknadDialogHandle: () => void;
  apneTidligereBehandlinger: () => void;
  visRevurderFagsakDialogHandle: () => void;
}
const Behandlingsmeny = ({
  redigerbart,
  behandlingstype,
  anmodningsperioderErSendtUtlandet,

  lagreOgLukkHandle,
  tilbakeleggeHandle,
  oppfriskSaksopplysningerHandle,
  visHenleggDialogHandle,
  visAvsluttSakSomBortfaltDialogHandle,
  visAvslagSoknadDialogHandle,
  apneTidligereBehandlinger,
  visRevurderFagsakDialogHandle,
}: Props) => (
  <Nav.EkspanderbartpanelBase
    ariaTittel="Behandlingsmeny"
    className="behandlingsmeny"
    heading={<div className="title">Behandlingsmeny</div>}
  >
    <div className="innhold">
      {redigerbart && (
        <Nav.Knapp mini className="element" onClick={lagreOgLukkHandle}>
          Lagre og lukk
        </Nav.Knapp>
      )}
      <Nav.Knapp disabled={!redigerbart} mini className="element" onClick={tilbakeleggeHandle}>
        Legg tilbake i kø
      </Nav.Knapp>
      {behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE &&
        !anmodningsperioderErSendtUtlandet && (
          <Nav.Knapp disabled={!redigerbart} mini className="element" onClick={oppfriskSaksopplysningerHandle}>
            Oppdater registeropplysninger
          </Nav.Knapp>
        )}
      {redigerbart && behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE && (
        <Nav.Knapp mini className="element" onClick={visHenleggDialogHandle}>
          Henlegg sak
        </Nav.Knapp>
      )}
      {redigerbart && behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE && (
        <Nav.Knapp mini className="element" onClick={visAvsluttSakSomBortfaltDialogHandle}>
          Avslutt sak som bortfalt
        </Nav.Knapp>
      )}
      {redigerbart && behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING && (
        <Nav.Knapp mini className="element" onClick={visAvslagSoknadDialogHandle}>
          Avslå søknad pga. manglende opplysninger
        </Nav.Knapp>
      )}
      <Nav.Knapp mini className="element" onClick={apneTidligereBehandlinger}>
        Vis alle behandlinger
      </Nav.Knapp>
      {(anmodningsperioderErSendtUtlandet ||
        (!redigerbart && behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE)) && (
        <Nav.Knapp mini className="element" onClick={visRevurderFagsakDialogHandle}>
          Vurder saken på nytt
        </Nav.Knapp>
      )}
    </div>
  </Nav.EkspanderbartpanelBase>
);

export default Behandlingsmeny;
