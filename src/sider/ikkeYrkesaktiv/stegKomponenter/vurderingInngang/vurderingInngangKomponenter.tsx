import React from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import * as Nav from "../../../../navFrontend";

export const LandValgSomOptions = ({ landValg }: { landValg: KTObject[] }) => {
  if (!landValg) return null;
  return (
    <>
      {landValg.map(({ kode, term }) => (
        <option key={kode} value={kode}>
          {term}
        </option>
      ))}
    </>
  );
};

export const FlytFinnesIkke = () => (
  <Nav.AlertStripeAdvarsel>
    <Nav.Typo.Undertittel> Det finnes ikke en stegvelger for landet du har valgt men: </Nav.Typo.Undertittel>
    <ul>
      <li>du kan bruke &quot;Send brev&quot;-fanen for å sende brev og vedtak</li>
      <li>du kan avslutte saken og angi behandlingsresultatet i behandlingsmenyen</li>
    </ul>
  </Nav.AlertStripeAdvarsel>
);
