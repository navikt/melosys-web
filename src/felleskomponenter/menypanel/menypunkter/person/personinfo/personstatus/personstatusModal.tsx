import React from "react";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";
import { Folkeregisterpersonstatus } from "../../../../../../graphql";
import { GyldighetshistorikkInfo } from "../../historikk/gyldighetshistorikkInfo";
import bem from "../../../../../../bemUtils";
import "./personstatusModal.css";

interface PersonstatusTabellProps {
  personstatuser: Folkeregisterpersonstatus[];
}

export const PersonstatusTabell = ({ personstatuser }: PersonstatusTabellProps) => {
  if (personstatuser.length < 1) {
    return (
      <Nav.Typo.Normaltekst className="personstatus-tabell-tom">
        Ingen historikk registrert i folkeregisteret.
      </Nav.Typo.Normaltekst>
    );
  }

  const personstatusTabellCls = bem("personstatus-tabell");

  return (
    <div className={personstatusTabellCls.block}>
      <Nav.Row className={personstatusTabellCls.element("header")}>
        <Nav.Column xs="5">Personstatus</Nav.Column>
        <Nav.Column xs="2">Kilde</Nav.Column>
        <Nav.Column xs="2">Register</Nav.Column>
        <Nav.Column xs="3">Gyldighetsdato</Nav.Column>
      </Nav.Row>
      {personstatuser.map((status) => (
        <Nav.Row className={personstatusTabellCls.element("row")} key={Utils._uuid()}>
          <Nav.Column xs="5">{status.tekst}</Nav.Column>
          <Nav.Column xs="2">{status.kilde}</Nav.Column>
          <Nav.Column xs="2">{status.master}</Nav.Column>
          <Nav.Column xs="3">{Utils.dato.formatterDatoTilNorsk(status.fregGyldighetstidspunkt)}</Nav.Column>
        </Nav.Row>
      ))}
    </div>
  );
};

interface PersonstatusModalProps {
  aktivePersonstatuser: Folkeregisterpersonstatus[];
  historiskePersonstatuser: Folkeregisterpersonstatus[];
  skalViseModal: boolean;
  lukkModal: () => void;
}

const PersonstatusModal = ({
  aktivePersonstatuser,
  historiskePersonstatuser,
  skalViseModal,
  lukkModal,
}: PersonstatusModalProps) => {
  const personstatusModalCls = bem("personstatus-modal");

  return (
    <Nav.Modal
      className={personstatusModalCls.block}
      contentLabel="Personstatus"
      onRequestClose={lukkModal}
      isOpen={skalViseModal}
      closeButton
    >
      <Nav.Typo.Innholdstittel>Personstatus</Nav.Typo.Innholdstittel>
      <PersonstatusTabell personstatuser={aktivePersonstatuser} />

      <Nav.Typo.Undertittel>Historikk</Nav.Typo.Undertittel>
      <GyldighetshistorikkInfo />
      <PersonstatusTabell personstatuser={historiskePersonstatuser} />
    </Nav.Modal>
  );
};

export default PersonstatusModal;
