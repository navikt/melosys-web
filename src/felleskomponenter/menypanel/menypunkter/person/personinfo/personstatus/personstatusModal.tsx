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
    return <Nav.BodyLong size="small">Ingen historikk registrert i folkeregisteret.</Nav.BodyLong>;
  }

  return (
    <Nav.Table>
      <Nav.Table.Header>
        <Nav.Table.Row>
          <Nav.Table.HeaderCell>Personstatus</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Kilde</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Register</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Gyldighetsdato</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {personstatuser.map((status) => (
          <Nav.Table.Row key={Utils._uuid()}>
            <Nav.Table.DataCell>{status.tekst}</Nav.Table.DataCell>
            <Nav.Table.DataCell>{status.kilde}</Nav.Table.DataCell>
            <Nav.Table.DataCell>{status.master}</Nav.Table.DataCell>
            <Nav.Table.DataCell>{Utils.dato.formatterDatoTilNorsk(status.fregGyldighetstidspunkt)}</Nav.Table.DataCell>
          </Nav.Table.Row>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
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
      className="sivilstand-modal"
      onClose={lukkModal}
      open={skalViseModal}
      header={{ heading: "Personstatus" }}
      closeOnBackdropClick
    >
      <Nav.Modal.Body>
        <PersonstatusTabell personstatuser={aktivePersonstatuser} />

        <Nav.Heading size="xsmall" className={personstatusModalCls.element("historikk")}>
          Historikk
        </Nav.Heading>
        <GyldighetshistorikkInfo />
        <PersonstatusTabell personstatuser={historiskePersonstatuser} />
      </Nav.Modal.Body>
    </Nav.Modal>
  );
};

export default PersonstatusModal;
