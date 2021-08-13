import React from "react";
import classNames from "classnames";

import * as Nav from "../../../../../../utils/navFrontend";
import * as Utils from "../../../../../../utils";

import { Statsborgerskap } from "../../../../../../graphql";

import GyldigPeriode from "./gyldigPeriode";

import "./rad.css";

interface RadProps {
  className?: string;
  gyldigPeriodeFarge: "groenn" | "roed";
  statsborgerskap: Statsborgerskap;
}

const Rad = ({
  className,
  gyldigPeriodeFarge,
  statsborgerskap: { land, master, kilde, bekreftelsesdato, gyldigFraOgMed, gyldigTilOgMed, erHistorisk },
}: RadProps) => {
  const cls = classNames(className, "statsborgerskapsliste__rad");

  const gyldigPeriodeCls = classNames({
    "statsborgerskapsliste__rad--roed": gyldigPeriodeFarge === "roed",
    "statsborgerskapsliste__rad--groenn": gyldigPeriodeFarge === "groenn",
  });

  const bekreftelsesdatoNorsk = Utils.dato.formatterDatoTilNorsk(bekreftelsesdato);

  return (
    <Nav.Row className={cls}>
      <Nav.Column xs="2">
        <Nav.Typo.Normaltekst>{land}</Nav.Typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="2">
        <Nav.Typo.Normaltekst>{master}</Nav.Typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="3">
        <Nav.Typo.Normaltekst>{kilde || ""}</Nav.Typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="3">
        <Nav.Typo.Normaltekst>{bekreftelsesdatoNorsk || ""}</Nav.Typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="2">
        <Nav.Typo.Normaltekst className={gyldigPeriodeCls}>
          <GyldigPeriode erHistorisk={erHistorisk} periode={{ fom: gyldigFraOgMed, tom: gyldigTilOgMed }} />
        </Nav.Typo.Normaltekst>
      </Nav.Column>
    </Nav.Row>
  );
};

export default Rad;
