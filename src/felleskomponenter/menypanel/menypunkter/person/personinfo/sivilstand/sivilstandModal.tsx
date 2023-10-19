import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";
import * as Mui from "../../../../../ui";

import bem from "../../../../../../bemUtils";
import KopierbarTekst from "../../../../../kopierbarTekst";
import { Sivilstand } from "../../../../../../graphql";
import { GyldighetshistorikkInfo } from "../../historikk/gyldighetshistorikkInfo";

import "./sivilstandModal.css";
import { Table } from "@navikt/ds-react";

Nav.Modal.setAppElement(document.getElementById("root"));

interface SivilstandTabellProps {
  sivilstander: Sivilstand[];
}

export const SivilstandTabell = ({ sivilstander }: SivilstandTabellProps) => {
  return (
    <Table>
      <Table.Header>
        <Table.HeaderCell>Sivilstand</Table.HeaderCell>
        <Table.HeaderCell>Relasjon til</Table.HeaderCell>
        <Table.HeaderCell>Kilde</Table.HeaderCell>
        <Table.HeaderCell>Register</Table.HeaderCell>
        <Table.HeaderCell>Bekreftelsesdato</Table.HeaderCell>
        <Table.HeaderCell>Gyldig f.o.m</Table.HeaderCell>
      </Table.Header>
      <Table.Body>
        {sivilstander.map((sivilstand) => (
          <Table.Row key={Utils._uuid()}>
            <Table.DataCell>{sivilstand.type}</Table.DataCell>
            <Table.DataCell>
              {sivilstand.relatertVedSivilstand && (
                <KopierbarTekst hovertekst="Kopier fødselsnummer">{sivilstand.relatertVedSivilstand}</KopierbarTekst>
              )}
            </Table.DataCell>
            <Table.DataCell>{sivilstand.kilde}</Table.DataCell>
            <Table.DataCell>{sivilstand.master}</Table.DataCell>
            <Table.DataCell>{Utils.dato.formatterDatoTilNorsk(sivilstand.bekreftelsesdato)}</Table.DataCell>
            <Table.DataCell>{Utils.dato.formatterDatoTilNorsk(sivilstand.gyldigFraOgMed)}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

interface SivilstandModalProps {
  aktiveSivilstander: Sivilstand[];
  historiskeSivilstander: Sivilstand[];
  skalViseModal: boolean;
  lukkModal: () => void;
  modalAriaHideApp?: boolean;
}

const SivilstandModal = ({
  aktiveSivilstander,
  historiskeSivilstander,
  skalViseModal,
  lukkModal,
  modalAriaHideApp = true,
}: SivilstandModalProps) => {
  const sivilstandModalCls = bem("sivilstand-modal");

  return (
    <Nav.Modal
      className={sivilstandModalCls.block}
      contentClass={sivilstandModalCls.element("content")}
      contentLabel="Sivilstand"
      onRequestClose={lukkModal}
      isOpen={skalViseModal}
      closeButton
      ariaHideApp={modalAriaHideApp}
    >
      <Mui.Undertittel tekst="Sivilstand" />
      <div className={sivilstandModalCls.element("main-content")}>
        {aktiveSivilstander.length > 0 && <SivilstandTabell sivilstander={aktiveSivilstander} />}
        <Nav.Typo.Element className={sivilstandModalCls.element("historikk")}>Historikk</Nav.Typo.Element>
        <GyldighetshistorikkInfo />
        {historiskeSivilstander.length > 0 ? (
          <SivilstandTabell sivilstander={historiskeSivilstander} />
        ) : (
          <Nav.Typo.Normaltekst>Ingen historikk registrert i folkeregisteret.</Nav.Typo.Normaltekst>
        )}
      </div>
    </Nav.Modal>
  );
};

export default SivilstandModal;
