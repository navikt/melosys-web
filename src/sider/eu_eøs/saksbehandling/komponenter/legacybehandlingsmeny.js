import React from "react";
import PT from "prop-types";

import * as Nav from "../../../../utils/navFrontend";

import "./legacybehandlingsmeny.css";

const Legacybehandlingsmeny = ({
  redigerbart,
  lagreOgLukkHandle,
  tilbakeleggeHandle,
  visHenleggDialogHandle,
  apneTidligereBehandlinger,
  visAvsluttSakSomBortfalt,
  visAvsluttSakSomBortfaltDialogHandle,
  visHenleggSak,
  visAvslagSoknadDialogHandle,
  visAvslagManglendeOpplysninger,
  visRevurderFagsakDialogHandle,
  visRevurderFagsak,
}) => (
  <Nav.EkspanderbartpanelBase
    ariaTittel="Behandlingsmeny"
    className="oppsummering__meny"
    heading={<div className="behandlingsmeny_title">Behandlingsmeny</div>}
  >
    <div className="meny__innhold">
      {redigerbart && (
        <Nav.Knapp mini className="innhold__element" onClick={lagreOgLukkHandle}>
          Lagre og lukk
        </Nav.Knapp>
      )}
      <Nav.Knapp disabled={!redigerbart} mini className="innhold__element" onClick={tilbakeleggeHandle}>
        Legg tilbake i kø
      </Nav.Knapp>
      {redigerbart && visHenleggSak && (
        <Nav.Knapp mini className="innhold__element" onClick={visHenleggDialogHandle}>
          Henlegg sak
        </Nav.Knapp>
      )}
      {redigerbart && visAvsluttSakSomBortfalt && (
        <Nav.Knapp mini className="innhold__element" onClick={visAvsluttSakSomBortfaltDialogHandle}>
          Avslutt sak som bortfalt
        </Nav.Knapp>
      )}
      {redigerbart && visAvslagManglendeOpplysninger && (
        <Nav.Knapp mini className="innhold__element" onClick={visAvslagSoknadDialogHandle}>
          Avslå søknad pga. manglende opplysninger
        </Nav.Knapp>
      )}
      <Nav.Knapp mini className="innhold__element" onClick={apneTidligereBehandlinger}>
        Vis alle behandlinger
      </Nav.Knapp>
      {visRevurderFagsak && (
        <Nav.Knapp mini className="innhold__element" onClick={visRevurderFagsakDialogHandle}>
          Vurder saken på nytt
        </Nav.Knapp>
      )}
    </div>
  </Nav.EkspanderbartpanelBase>
);

Legacybehandlingsmeny.propTypes = {
  lagreOgLukkHandle: PT.func.isRequired,
  tilbakeleggeHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  visAvsluttSakSomBortfalt: PT.bool.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  apneTidligereBehandlinger: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  visHenleggSak: PT.bool.isRequired,
  visRevurderFagsakDialogHandle: PT.func.isRequired,
  visAvslagManglendeOpplysninger: PT.bool.isRequired,
  visRevurderFagsak: PT.bool.isRequired,
};

export default Legacybehandlingsmeny;
