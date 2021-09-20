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
  visBareFomTom?: boolean;
}

const Adresseheader = ({ adressetype, visBareFomTom }: AdresseheaderProps) => {
  const periodetekst = `Gyldig f.o.m.${visBareFomTom ? " - t.o.m." : ""}`;
  const innhold = {
    adressetype: visBareFomTom ? "" : <Nav.Typo.Element>{Adressetype[adressetype]}</Nav.Typo.Element>,
    register: visBareFomTom ? "" : <Nav.Typo.Element>Register</Nav.Typo.Element>,
    kilde: visBareFomTom ? "" : <Nav.Typo.Element>Kilde</Nav.Typo.Element>,
    periode: <Nav.Typo.Element>{periodetekst}</Nav.Typo.Element>,
  };

  return (
    <Adresserad
      kolonner={[
        {
          innhold: innhold.adressetype,
          bredde: "3",
        },
        {
          innhold: innhold.register,
          bredde: "3",
        },
        {
          innhold: innhold.kilde,
          bredde: "3",
        },
        {
          innhold: innhold.periode,
          bredde: "3",
        },
      ]}
    />
  );
};

export default Adresseheader;
