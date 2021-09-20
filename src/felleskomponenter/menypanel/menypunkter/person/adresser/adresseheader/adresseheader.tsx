import React from "react";

import * as Nav from "../../../../../../utils/navFrontend";

import Adresserad from "../adresserad";

import "./adresseheader.css";

export enum Adressetype {
  Bostedsadresse = "Bostedsadresse",
  Oppholdsadresse = "Oppholdsadresse",
  Kontaktadresse = "Kontaktadresse",
}

interface AdresseheaderProps {
  adressetype: Adressetype;
  visTom?: boolean;
}

const Adresseheader = ({ adressetype, visTom }: AdresseheaderProps) => {
  const periodetekst = `Gyldig f.o.m.${visTom ? " - t.o.m." : ""}`;

  return (
    <Adresserad
      kolonner={[
        {
          innhold: <Nav.Typo.Element>{Adressetype[adressetype]}</Nav.Typo.Element>,
          bredde: "3",
        },
        {
          innhold: <Nav.Typo.Element>Register</Nav.Typo.Element>,
          bredde: "3",
        },
        {
          innhold: <Nav.Typo.Element>Kilde</Nav.Typo.Element>,
          bredde: "3",
        },
        {
          innhold: <Nav.Typo.Element>{periodetekst}</Nav.Typo.Element>,
          bredde: "3",
        },
      ]}
    />
  );
};

export default Adresseheader;
