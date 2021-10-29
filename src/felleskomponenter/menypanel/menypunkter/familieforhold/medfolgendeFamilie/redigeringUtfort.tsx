import React from "react";

import * as Nav from "../../../../../navFrontend";
import * as KV from "../../../../../kodeverk";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";
import KopierbarTekst from "../../../../kopierbarTekst";

import ExpandableList from "../../../../expandablelist";

import "./redigeringUtfort.css";

const Header = () => (
  <Nav.Row className="header">
    <Nav.Column xs="6">F.nr./d-nr.</Nav.Column>
    <Nav.Column xs="6">Navn</Nav.Column>
  </Nav.Row>
);

interface RadProps {
  navn?: string;
  idNummer?: number;
}

const Rad = ({ navn, idNummer }: RadProps) => (
  <Nav.Row className="rad">
    <Nav.Column xs="6">{idNummer && <KopierbarTekst>{idNummer.toString()}</KopierbarTekst>}</Nav.Column>
    <Nav.Column xs="6">{navn}</Nav.Column>
  </Nav.Row>
);

const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.MedfolgendeFamilie>) => (
  <div className="medfolgende-familie__redigeringutfort">
    <ExpandableList
      elements={verdier}
      header={<Header />}
      renderElement={(familie) => <Rad navn={familie.navn} idNummer={familie.fnr} />}
      idFromElement={(familie) => familie.uuid}
      amountOfItemsCollapsed={verdier.length}
      btnTextCollapsed="Vis flere"
      btnTextExpanded="Vis færre"
      chevron
      dividers
    />
  </div>
);

export default RedigeringUtfort;
