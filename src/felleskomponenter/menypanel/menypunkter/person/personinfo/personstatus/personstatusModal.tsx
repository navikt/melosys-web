import React from "react";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";
import { Folkeregisterpersonstatus } from "../../../../../../graphql";
import "./personstatusModal.css";
import bem from "../../../../../../bemUtils";

interface PersonstatusTabellProps {
  personstatuser: Folkeregisterpersonstatus[];
}

export const PersonstatusTabell = ({ personstatuser }: PersonstatusTabellProps) => {
  if (personstatuser.length < 1) {
    return <Nav.Typo.Normaltekst>Ingen historikk registrert i folkeregisteret.</Nav.Typo.Normaltekst>;
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
      <div className={personstatusModalCls.element("gyldighetsinfo")}>
        <Nav.Typo.EtikettLiten>Gyldighetshistorikk fra Folkeregisteret kan være unøyaktig.</Nav.Typo.EtikettLiten>
        <Nav.Hjelpetekst>
          <p>Det kan variere hvordan gyldighetsdato benyttes i Folkeregisteret.</p>
          <p>
            Dersom det er en opplysningstype hvor Folkeregisteret har vedtaksmyndighet, så viser denne datoen når
            vedtaket gjelder fra. På andre opplysningstyper viser datoen når opplysningen ble gyldig i Folkeregisteret,
            ikke når den ble gyldig i virkeligheten. For eksempel viser ikke gyldighetsdato for opplysningstypen
            utflytting når man faktisk flyttet ut av landet.
          </p>
          <p>Vær derfor varsom med hvordan du bruker disse opplysningene.</p>
        </Nav.Hjelpetekst>
      </div>
      <PersonstatusTabell personstatuser={historiskePersonstatuser} />
    </Nav.Modal>
  );
};

export default PersonstatusModal;
