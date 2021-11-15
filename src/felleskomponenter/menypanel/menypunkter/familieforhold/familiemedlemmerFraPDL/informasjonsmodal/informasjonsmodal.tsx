import React, { ComponentProps } from "react";

import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";

import { useHentBostedsadresseForPersonQuery } from "./hentBostedsadresseForPerson.generated";
import { StrukturertAdresse } from "../../../../../adresser";

import "./informasjonsmodal.css";

Nav.Modal.setAppElement(document.getElementById("root"));

interface InformasjonsmodalProps {
  onRequestClose: ComponentProps<typeof Nav.Modal>["onRequestClose"];
  contentLabel: ComponentProps<typeof Nav.Modal>["contentLabel"];
  barnNavn: string;
  forelderIdent: string;
  ariaHideApp?: boolean;
}

const Informasjonsmodal = ({
  onRequestClose,
  contentLabel,
  barnNavn,
  forelderIdent,
  ariaHideApp = true,
}: InformasjonsmodalProps) => {
  const { data, error, loading } = useHentBostedsadresseForPersonQuery({ variables: { ident: forelderIdent } });

  const loadingContent = (
    <div>
      Henter bostedsadresse til annen forelder...
      <Nav.NavFrontendSpinner />
    </div>
  );

  const errorContent = <Nav.AlertStripeFeil>Feil ved henting av bostedsadresse!</Nav.AlertStripeFeil>;

  const fornavn = data?.hentPersonopplysninger.navn.fornavn ?? "";
  const mellomnavn = data?.hentPersonopplysninger.navn.mellomnavn ?? "";
  const etternavn = data?.hentPersonopplysninger.navn.etternavn ?? "";
  const navn = `${fornavn} ${mellomnavn} ${etternavn}`.trim();
  const aktiveBostedsadresser =
    data?.hentPersonopplysninger.bostedsadresser.filter((bostedsadresse) => !bostedsadresse.erHistorisk) || [];

  const mainContent = (
    <div>
      <Nav.Row className="informasjonsmodal__tabell-header">
        <Nav.Column xs="3">Navn forelder</Nav.Column>
        <Nav.Column xs="3">Adresse</Nav.Column>
        <Nav.Column xs="3">Register</Nav.Column>
        <Nav.Column xs="3">Kilde</Nav.Column>
      </Nav.Row>
      {aktiveBostedsadresser.length > 0 ? (
        aktiveBostedsadresser.map((bostedsadresse) => (
          <Nav.Row className="informasjonsmodal__tabell-row" key={Utils._uuid()}>
            <Nav.Column xs="3">{navn}</Nav.Column>
            <Nav.Column xs="3">
              <StrukturertAdresse adresse={bostedsadresse.adresse} />
            </Nav.Column>
            <Nav.Column xs="3">{bostedsadresse.master}</Nav.Column>
            <Nav.Column xs="3">{bostedsadresse.kilde}</Nav.Column>
          </Nav.Row>
        ))
      ) : (
        <Nav.Row className="informasjonsmodal__tabell-row">
          <Nav.Column xs="3">{navn}</Nav.Column>
          <Nav.Column xs="3">Ukjent</Nav.Column>
          <Nav.Column xs="3">Ukjent</Nav.Column>
          <Nav.Column xs="3">Ukjent</Nav.Column>
        </Nav.Row>
      )}
    </div>
  );

  return (
    <Nav.Modal
      contentClass="informasjonsmodal"
      contentLabel={contentLabel}
      isOpen
      shouldCloseOnOverlayClick
      closeButton
      onRequestClose={onRequestClose}
      // @ts-ignore
      ariaHideApp={ariaHideApp}
    >
      <Nav.Typo.Element>Barn: {barnNavn}</Nav.Typo.Element>
      {loading && loadingContent}
      {error && errorContent}
      {!loading && !error && data && mainContent}
    </Nav.Modal>
  );
};

export default Informasjonsmodal;
