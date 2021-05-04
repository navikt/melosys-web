import React from "react";
import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../utils/navFrontend";
import "./behandlingsmeny.css";

const { AVSLUTTET, MIDLERTIDIG_LOVVALGSBESLUTNING } = MKV.Koder.behandlinger.behandlingsstatus;

interface Props {
  redigerbart: boolean;
  behandlingsstatus: string;
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
  behandlingsstatus,
  anmodningsperioderErSendtUtlandet,
  lagreOgLukkHandle,
  tilbakeleggeHandle,
  oppfriskSaksopplysningerHandle,
  visHenleggDialogHandle,
  visAvsluttSakSomBortfaltDialogHandle,
  visAvslagSoknadDialogHandle,
  apneTidligereBehandlinger,
  visRevurderFagsakDialogHandle,
}: Props) => {
  const behandlingErAvsluttet = [AVSLUTTET, MIDLERTIDIG_LOVVALGSBESLUTNING].includes(behandlingsstatus);

  return (
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
        {!anmodningsperioderErSendtUtlandet && (
          <Nav.Knapp disabled={!redigerbart} mini className="element" onClick={oppfriskSaksopplysningerHandle}>
            Oppdater registeropplysninger
          </Nav.Knapp>
        )}
        {redigerbart && (
          <Nav.Knapp mini className="element" onClick={visHenleggDialogHandle}>
            Henlegg sak
          </Nav.Knapp>
        )}
        {redigerbart && (
          <Nav.Knapp mini className="element" onClick={visAvsluttSakSomBortfaltDialogHandle}>
            Avslutt sak som bortfalt
          </Nav.Knapp>
        )}
        {redigerbart && (
          <Nav.Knapp mini className="element" onClick={visAvslagSoknadDialogHandle}>
            Avslå søknad pga. manglende opplysninger
          </Nav.Knapp>
        )}
        <Nav.Knapp mini className="element" onClick={apneTidligereBehandlinger}>
          Vis alle behandlinger
        </Nav.Knapp>
        {(anmodningsperioderErSendtUtlandet || behandlingErAvsluttet) && (
          <Nav.Knapp mini className="element" onClick={visRevurderFagsakDialogHandle}>
            Vurder saken på nytt
          </Nav.Knapp>
        )}
      </div>
    </Nav.EkspanderbartpanelBase>
  );
};

export default Behandlingsmeny;
