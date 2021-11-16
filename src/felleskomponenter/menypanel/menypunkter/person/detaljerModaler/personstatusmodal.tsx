import React from "react";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import ExpandableList from "../../../../expandablelist";
import "./detaljerModaler.css";

interface PersonstatusLinjeProps {
  personstatus: string;
  kilde: string;
  register: string;
  bekreftelsesdato: Date;
  fom: Date;
  key?: number | undefined;
}

const PersonstatusHeader = () => (
  <Nav.Row className="personinfo__modal__tabell_header">
    <Nav.Column xs="2">Personstatus</Nav.Column>
    <Nav.Column xs="2">Kilde</Nav.Column>
    <Nav.Column xs="2">Register</Nav.Column>
    <Nav.Column xs="3">Bekreftelsesdato</Nav.Column>
    <Nav.Column xs="3">Gyldig f.o.m</Nav.Column>
  </Nav.Row>
);

const PersonstatusRad = (data: PersonstatusLinjeProps) => (
  <Nav.Row className="personinfo__modal__tabell_rad">
    <Nav.Column xs="2">{data.personstatus}</Nav.Column>
    <Nav.Column xs="2">{data.kilde}</Nav.Column>
    <Nav.Column xs="2">{data.register}</Nav.Column>
    <Nav.Column xs="3">{Utils.dato.formatterDatoTilNorsk(data.bekreftelsesdato)}</Nav.Column>
    <Nav.Column xs="3">{Utils.dato.formatterDatoTilNorsk(data.fom)}</Nav.Column>
  </Nav.Row>
);

interface PersonstatusModalProps {
  lukkModal: () => void;
}

const PersonstatusModal = ({ lukkModal }: PersonstatusModalProps) => {
  const status: PersonstatusLinjeProps[] = [
    {
      personstatus: "Bosatt",
      kilde: "Bruker",
      register: "F.reg",
      bekreftelsesdato: new Date(2021, 2, 11),
      fom: new Date(2020, 12, 10),
    },
  ];
  const statusHistorikk: PersonstatusLinjeProps[] = [
    {
      personstatus: "Midlertidig",
      kilde: "System",
      register: "F.reg",
      bekreftelsesdato: new Date(2016, 10, 1),
      fom: new Date(2016, 10, 1),
    },
    {
      personstatus: "Utflyttet",
      kilde: "Bruker",
      register: "F.reg",
      bekreftelsesdato: new Date(2010, 8, 7),
      fom: new Date(2010, 8, 7),
    },
    {
      personstatus: "Ikke bosatt",
      kilde: "System",
      register: "F.reg",
      bekreftelsesdato: new Date(2010, 5, 12),
      fom: new Date(2010, 5, 10),
    },
  ];
  return (
    <Nav.Modal className="personinfo__modal" contentLabel="Personstatus" onRequestClose={lukkModal} closeButton isOpen>
      <Nav.Typo.Innholdstittel>Personstatus</Nav.Typo.Innholdstittel>
      <ExpandableList
        renderElement={(s) => (
          <PersonstatusRad
            personstatus={s.personstatus}
            kilde={s.kilde}
            register={s.register}
            bekreftelsesdato={s.bekreftelsesdato}
            fom={s.fom}
          />
        )}
        header={<PersonstatusHeader />}
        idFromElement={Utils._uuid}
        elements={status}
        amountOfItemsCollapsed={status.length}
        chevron
        dividers
      />
      <Nav.Typo.Undertittel>Historikk</Nav.Typo.Undertittel>
      <Nav.Typo.EtikettLiten>Personstatusopplysninger fra folkeregisteret kan være mangelfulle. </Nav.Typo.EtikettLiten>
      <ExpandableList
        renderElement={(s) => (
          <PersonstatusRad
            personstatus={s.personstatus}
            kilde={s.kilde}
            register={s.register}
            bekreftelsesdato={s.bekreftelsesdato}
            fom={s.fom}
          />
        )}
        header={<PersonstatusHeader />}
        idFromElement={Utils._uuid}
        elements={statusHistorikk}
        amountOfItemsCollapsed={statusHistorikk.length}
        chevron
        dividers
      />
    </Nav.Modal>
  );
};

export default PersonstatusModal;
