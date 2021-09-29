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
    adressetype: visBareFomTom ? "" : <Nav.Typo.Normaltekst>{Adressetype[adressetype]}</Nav.Typo.Normaltekst>,
    register: visBareFomTom ? "" : <Nav.Typo.Normaltekst>Register</Nav.Typo.Normaltekst>,
    kilde: visBareFomTom ? "" : <Nav.Typo.Normaltekst>Kilde</Nav.Typo.Normaltekst>,
    periode: <Nav.Typo.Normaltekst>{periodetekst}</Nav.Typo.Normaltekst>,
  };

  return (
    <Adresserad
      className="adresselisteheader"
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
