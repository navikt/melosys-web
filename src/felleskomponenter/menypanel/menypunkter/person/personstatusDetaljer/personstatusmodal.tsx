import React from "react";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import ExpandableList from "../../../../expandablelist";
import hentPersonstatus from "./hentpersonstatus";
import "./personstatusmodal.css";

interface PersonstatusLinjeProps {
  personstatus: string;
  kilde?: string | null;
  register: string;
  gyldighetsdato?: string | null;
  key?: number | undefined;
}

const PersonstatusHeader = () => (
  <Nav.Row className="personstatus_modal__tabell_header">
    <Nav.Column xs="5">Personstatus</Nav.Column>
    <Nav.Column xs="2">Kilde</Nav.Column>
    <Nav.Column xs="2">Register</Nav.Column>
    <Nav.Column xs="3">Gyldighetsdato</Nav.Column>
  </Nav.Row>
);

const PersonstatusRad = (data: PersonstatusLinjeProps) => (
  <Nav.Row className="personstatus_modal__tabell_rad">
    <Nav.Column xs="5">{data.personstatus}</Nav.Column>
    <Nav.Column xs="2">{data.kilde}</Nav.Column>
    <Nav.Column xs="2">{data.register}</Nav.Column>
    <Nav.Column xs="3">{data.gyldighetsdato}</Nav.Column>
  </Nav.Row>
);

interface PersonstatusModalProps {
  behandlingID: number;
  skalViseModal: boolean;
  lukkModal: () => void;
}

const PersonstatusModal = ({ behandlingID, skalViseModal, lukkModal }: PersonstatusModalProps) => {
  if (behandlingID < 0) return null;

  const personstatuser = hentPersonstatus(behandlingID);
  const status = personstatuser.filter((personstatus) => !personstatus.erHistorisk);
  const statusHistorikk = personstatuser.filter((personstatus) => personstatus.erHistorisk);

  return (
    <Nav.Modal
      className="personstatus_modal"
      contentLabel="Personstatus"
      onRequestClose={lukkModal}
      isOpen={skalViseModal}
      closeButton
    >
      <Nav.Typo.Innholdstittel>Personstatus</Nav.Typo.Innholdstittel>
      <ExpandableList
        renderElement={(s) => (
          <PersonstatusRad
            personstatus={s.tekst}
            kilde={s.kilde}
            register={s.master}
            gyldighetsdato={s.fregGyldighetstidspunkt}
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
      <div className="personstatus_modal__gyldighetsinfo">
        <Nav.Typo.EtikettLiten>Gyldighetshistorikk fra folkeregisteret kan være mangelfulle.</Nav.Typo.EtikettLiten>
        <Nav.Hjelpetekst>
          Det kan variere hvordan gyldighetsdato benyttes i Folkeregisteret. Dersom det er en opplysningstype hvor
          Folkeregisteret har vedtaksmyndighet, så viser denne datoen når vedtaket gjelder fra. På andre
          opplysningstyper viser datoen når opplysningen ble gyldig i Folkeregisteret, ikke når den ble gyldig i
          virkeligheten. For eksempel viser ikke gyldighetsdato for opplysningstypen utflytting når man faktisk flyttet
          ut av landet. Vær derfor varsom med hvordan du bruker disse opplysningene.
        </Nav.Hjelpetekst>
      </div>
      <ExpandableList
        renderElement={(s) => (
          <PersonstatusRad
            personstatus={s.tekst}
            kilde={s.kilde}
            register={s.master}
            gyldighetsdato={s.fregGyldighetstidspunkt}
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
