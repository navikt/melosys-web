import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";

import bem from "../../../../../../bemUtils";
import KopierbarTekst from "../../../../../kopierbarTekst";
import { Sivilstand } from "../../../../../../graphql";
import { GyldighetshistorikkInfo } from "../../historikk/gyldighetshistorikkInfo";

import "./sivilstandModal.css";

interface SivilstandTabellProps {
  sivilstander: Sivilstand[];
}

export const SivilstandTabell = ({ sivilstander }: SivilstandTabellProps) => {
  return (
    <Nav.Table>
      <Nav.Table.Header>
        <Nav.Table.Row>
          <Nav.Table.HeaderCell>Sivilstand</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Relasjon til</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Kilde</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Register</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Bekreftelsesdato</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Gyldig f.o.m</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {sivilstander.map((sivilstand) => (
          <Nav.Table.Row key={Utils._uuid()}>
            <Nav.Table.DataCell>{sivilstand.type}</Nav.Table.DataCell>
            <Nav.Table.DataCell>
              {sivilstand.relatertVedSivilstand && (
                <KopierbarTekst hovertekst="Kopier fødselsnummer">{sivilstand.relatertVedSivilstand}</KopierbarTekst>
              )}
            </Nav.Table.DataCell>
            <Nav.Table.DataCell>{sivilstand.kilde}</Nav.Table.DataCell>
            <Nav.Table.DataCell>{sivilstand.master}</Nav.Table.DataCell>
            <Nav.Table.DataCell>{Utils.dato.formatterDatoTilNorsk(sivilstand.bekreftelsesdato)}</Nav.Table.DataCell>
            <Nav.Table.DataCell>{Utils.dato.formatterDatoTilNorsk(sivilstand.gyldigFraOgMed)}</Nav.Table.DataCell>
          </Nav.Table.Row>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
};

interface SivilstandModalProps {
  aktiveSivilstander: Sivilstand[];
  historiskeSivilstander: Sivilstand[];
  skalViseModal: boolean;
  lukkModal: () => void;
}

const SivilstandModal = ({
  aktiveSivilstander,
  historiskeSivilstander,
  skalViseModal,
  lukkModal,
}: SivilstandModalProps) => {
  const sivilstandModalCls = bem("sivilstand-modal");

  return (
    <Nav.Modal
      className="sivilstand-modal"
      closeOnBackdropClick
      onClose={lukkModal}
      open={skalViseModal}
      header={{ heading: "Sivilstand" }}
    >
      <Nav.Modal.Body>
        <div className={sivilstandModalCls.element("main-content")}>
          {aktiveSivilstander.length > 0 && <SivilstandTabell sivilstander={aktiveSivilstander} />}
          <Nav.Typo.Element className={sivilstandModalCls.element("historikk")}>Historikk</Nav.Typo.Element>
          <GyldighetshistorikkInfo />
          {historiskeSivilstander.length > 0 ? (
            <SivilstandTabell sivilstander={historiskeSivilstander} />
          ) : (
            <Nav.BodyLong size="small">Ingen historikk registrert i folkeregisteret.</Nav.BodyLong>
          )}
        </div>
      </Nav.Modal.Body>
    </Nav.Modal>
  );
};

export default SivilstandModal;
