import React from "react";
import classNames from "classnames";

import * as Nav from "../../../../../../utils/navFrontend";

import { Statsborgerskap } from "../../../../../../graphql";

import GyldigPeriode from "./gyldigPeriode";

import "./rad.css";

interface RadProps {
  className?: string;
  gyldigFomFarge: "groenn" | "roed";
  statsborgerskap: Statsborgerskap;
}

const Rad = ({
  className,
  gyldigFomFarge,
  statsborgerskap: { land, master, kilde, bekreftelsesdato, gyldigFraOgMed, gyldigTilOgMed, erHistorisk },
}: RadProps) => {
  const cls = classNames(className, "statsborgerskapsliste__rad");

  const gyldigFomCls = classNames({
    "statsborgerskapsliste__rad--roed": gyldigFomFarge === "roed",
    "statsborgerskapsliste__rad--groenn": gyldigFomFarge === "groenn",
  });

  return (
    <Nav.Row className={cls}>
      <Nav.Column xs="2">
        <Nav.Typo.Normaltekst>{land}</Nav.Typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="2">
        <Nav.Typo.Normaltekst>{master}</Nav.Typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="3">
        <Nav.Typo.Normaltekst>{kilde}</Nav.Typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="3">
        <Nav.Typo.Normaltekst>{bekreftelsesdato}</Nav.Typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="2">
        <Nav.Typo.Normaltekst className={gyldigFomCls}>
          <GyldigPeriode erHistorisk={erHistorisk} periode={{ fom: gyldigFraOgMed, tom: gyldigTilOgMed }} />
        </Nav.Typo.Normaltekst>
      </Nav.Column>
    </Nav.Row>
  );
};

export default Rad;
