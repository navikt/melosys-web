import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";
import { Folkeregisterpersonstatus } from "../../../../../../graphql";
import { GyldighetshistorikkInfo } from "../../historikk/gyldighetshistorikkInfo";
import bem from "../../../../../../bemUtils";
import "./personstatusModal.css";
import { Table } from "@navikt/ds-react";

interface PersonstatusTabellProps {
  personstatuser: Folkeregisterpersonstatus[];
}

export const PersonstatusTabell = ({ personstatuser }: PersonstatusTabellProps) => {
  if (personstatuser.length < 1) {
    return <Nav.Typo.Normaltekst>Ingen historikk registrert i folkeregisteret.</Nav.Typo.Normaltekst>;
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Personstatus</Table.HeaderCell>
          <Table.HeaderCell>Kilde</Table.HeaderCell>
          <Table.HeaderCell>Register</Table.HeaderCell>
          <Table.HeaderCell>Gyldighetsdato</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {personstatuser.map((status) => (
          <Table.Row key={Utils._uuid()}>
            <Table.DataCell>{status.tekst}</Table.DataCell>
            <Table.DataCell>{status.kilde}</Table.DataCell>
            <Table.DataCell>{status.master}</Table.DataCell>
            <Table.DataCell>{Utils.dato.formatterDatoTilNorsk(status.fregGyldighetstidspunkt)}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

interface PersonstatusModalProps {
  aktivePersonstatuser: Folkeregisterpersonstatus[];
  historiskePersonstatuser: Folkeregisterpersonstatus[];
  skalViseModal: boolean;
  lukkModal: () => void;
  modalAriaHideApp?: boolean;
}

const PersonstatusModal = ({
  aktivePersonstatuser,
  historiskePersonstatuser,
  skalViseModal,
  lukkModal,
  modalAriaHideApp = true,
}: PersonstatusModalProps) => {
  const personstatusModalCls = bem("personstatus-modal");

  return (
    <Nav.Modal
      className={personstatusModalCls.block}
      contentLabel="Personstatus"
      onRequestClose={lukkModal}
      isOpen={skalViseModal}
      closeButton
      ariaHideApp={modalAriaHideApp}
    >
      <Nav.Typo.Innholdstittel>Personstatus</Nav.Typo.Innholdstittel>
      <PersonstatusTabell personstatuser={aktivePersonstatuser} />

      <Nav.Typo.Undertittel className={personstatusModalCls.element("historikk")}>Historikk</Nav.Typo.Undertittel>
      <GyldighetshistorikkInfo />
      <PersonstatusTabell personstatuser={historiskePersonstatuser} />
    </Nav.Modal>
  );
};

export default PersonstatusModal;
