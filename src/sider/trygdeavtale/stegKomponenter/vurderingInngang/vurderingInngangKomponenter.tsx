import React, { Fragment } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import * as Nav from "../../../../navFrontend";

export const ArbeidslandLabel = () => {
  const hjelpetekst = "Oppgi landet der arbeidet utføres. Hvis søker arbeider på skip, skal du oppgi flagglandet.";
  return (
    <Fragment>
      Arbeidsland
      <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>
        {hjelpetekst}
      </Nav.Hjelpetekst>
    </Fragment>
  );
};

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
    <Nav.Typo.Undertittel> Det finnes ikke en stegvelger for landet du har valgt </Nav.Typo.Undertittel>
    <ul>
      <li>Du kan fremdeles bruke &quot;Send brev&quot;-fanen for å sende brev og vedtak</li>
      <li>I behandlingsmenyen kan du avslutte saken og angi behandlingsresultatet</li>
    </ul>
  </Nav.AlertStripeAdvarsel>
);
