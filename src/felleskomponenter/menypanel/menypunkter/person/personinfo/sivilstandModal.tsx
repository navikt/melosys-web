import React, { ComponentProps } from "react";

import * as Nav from "../../../../../navFrontend";
import * as Ikoner from "../../../../../resources/images";
import * as Utils from "../../../../../utils";
import * as Mui from "../../../../ui";

import bem from "../../../../../bemUtils";
import { Sivilstand } from "../../../../../graphql";
import KopierbarTekst from "../../../../kopierbarTekst";
import { useHentSivilstandQuery } from "./hentSivilstand.generated";

import "./sivilstandModal.css";

Nav.Modal.setAppElement(document.getElementById("root"));

interface SivilstandTabellProps {
  sivilstander: Sivilstand[];
}

const SivilstandTabell = ({ sivilstander }: SivilstandTabellProps) => {
  const sivilstandTabellCls = bem("sivilstand-tabell");

  return (
    <div className={sivilstandTabellCls.block}>
      <Nav.Row className={sivilstandTabellCls.element("header")}>
        <Nav.Column xs="2">Sivilstand</Nav.Column>
        <Nav.Column xs="2">Relasjon til</Nav.Column>
        <Nav.Column xs="2">Kilde</Nav.Column>
        <Nav.Column xs="2">Register</Nav.Column>
        <Nav.Column xs="2">Bekreftelsesdato</Nav.Column>
        <Nav.Column xs="2">Gyldig f.o.m</Nav.Column>
      </Nav.Row>
      {sivilstander.map((sivilstand) => (
        <Nav.Row className={sivilstandTabellCls.element("row")} key={Utils._uuid()}>
          <Nav.Column xs="2">{sivilstand.type}</Nav.Column>
          <Nav.Column xs="2">
            {sivilstand.relatertVedSivilstand && (
              <KopierbarTekst hovertekst="Kopier fødselsnummer">{sivilstand.relatertVedSivilstand}</KopierbarTekst>
            )}
          </Nav.Column>
          <Nav.Column xs="2">{sivilstand.kilde}</Nav.Column>
          <Nav.Column xs="2">{sivilstand.master}</Nav.Column>
          <Nav.Column xs="2">{Utils.dato.formatterDatoTilNorsk(sivilstand.bekreftelsesdato)}</Nav.Column>
          <Nav.Column xs="2">{Utils.dato.formatterDatoTilNorsk(sivilstand.gyldigFraOgMed)}</Nav.Column>
        </Nav.Row>
      ))}
    </div>
  );
};

interface SivilstandModalProps {
  onRequestClose: ComponentProps<typeof Nav.Modal>["onRequestClose"];
  ariaHideApp?: boolean;
  behandlingID: number;
}

const SivilstandModal = ({ onRequestClose, ariaHideApp = true, behandlingID }: SivilstandModalProps) => {
  const { data, loading, error } = useHentSivilstandQuery({ variables: { behandlingID } });

  const loadingContent = (
    <>
      Henter sivilstand...
      <Nav.NavFrontendSpinner />
    </>
  );

  const errorContent = <Nav.AlertStripeFeil>Feil ved henting av sivilstand!</Nav.AlertStripeFeil>;

  const aktiveSivilstander =
    data?.hentSaksopplysninger.persondata.sivilstand.filter((sivilstand) => !sivilstand.erHistorisk) || [];
  const historiskeSivilstander =
    data?.hentSaksopplysninger.persondata.sivilstand.filter((sivilstand) => sivilstand.erHistorisk) || [];

  const mainContent = (
    <>
      {aktiveSivilstander.length > 0 && <SivilstandTabell sivilstander={aktiveSivilstander} />}
      {historiskeSivilstander.length > 0 && (
        <>
          <Nav.Typo.Element>Historikk</Nav.Typo.Element>
          <SivilstandTabell sivilstander={historiskeSivilstander} />
        </>
      )}
    </>
  );

  const sivilstandModalCls = bem("sivilstand-modal");

  return (
    <Nav.Modal
      contentLabel="Sivilstand"
      isOpen
      onRequestClose={onRequestClose}
      closeButton
      // @ts-ignore
      ariaHideApp={ariaHideApp}
      className={sivilstandModalCls.block}
      contentClass={sivilstandModalCls.element("content")}
    >
      <Mui.Undertittel tekst="Sivilstand" ikon={Ikoner.Ring} />
      {loading && loadingContent}
      {error && (
        <div aria-live="polite" aria-atomic>
          {errorContent}
        </div>
      )}
      {!loading && !error && data && (
        <div aria-live="polite" aria-atomic className={sivilstandModalCls.element("main-content")}>
          {mainContent}
        </div>
      )}
    </Nav.Modal>
  );
};

export default SivilstandModal;
