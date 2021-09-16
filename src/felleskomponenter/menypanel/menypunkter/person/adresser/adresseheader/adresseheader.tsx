import React from "react";

import Adresserad from "../adresserad";

export enum Adressetype {
  Bostedsadresse = "Bostedsadresse",
  Oppholdsadresse = "Oppholdsadresse",
  Kontaktadresse = "Kontaktadresse",
}

interface AdresseheaderProps {
  adressetype: Adressetype;
  visTom?: boolean;
}

const Adresseheader = ({ adressetype, visTom }: AdresseheaderProps) => (
  <Adresserad
    kolonner={[
      {
        innhold: Adressetype[adressetype],
        bredde: "3",
      },
      {
        innhold: "Register",
        bredde: "3",
      },
      {
        innhold: "Kilde",
        bredde: "3",
      },
      {
        innhold: `Gyldig f.o.m.${visTom ? " - t.o.m." : ""}`,
        bredde: "3",
      },
    ]}
  />
);

export default Adresseheader;
