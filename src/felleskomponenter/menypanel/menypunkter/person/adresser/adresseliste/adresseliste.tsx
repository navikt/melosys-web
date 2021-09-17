import React from "react";

import * as Utils from "../../../../../../utils";

import { Bostedsadresse, Oppholdsadresse, Kontaktadresse } from "../../../../../../graphql";

import ExpandableList from "../../../../../expandablelist";
import { StrukturertAdresse, SemistrukturertAdresse } from "../../../../../adresser";
import Adresseheader, { Adressetype } from "../adresseheader";
import Adresserad from "../adresserad";

type Adresse = Bostedsadresse | Oppholdsadresse | Kontaktadresse;

function isKontaktAdresse(adresse: Adresse): adresse is Kontaktadresse {
  return (adresse as Kontaktadresse).semistrukturertAdresse !== undefined;
}

const renderAdressekomponent = (adresse: Adresse) => {
  if (isKontaktAdresse(adresse)) {
    if (adresse.strukturertAdresse) return <StrukturertAdresse adresse={adresse.strukturertAdresse} />;
    if (adresse.semistrukturertAdresse) return <SemistrukturertAdresse adresse={adresse.semistrukturertAdresse} />;
    return null;
  }

  return <StrukturertAdresse adresse={adresse.adresse} />;
};

interface AdresselisteProps {
  adressetype: Adressetype;
  adresser: Adresse[];
}

const Adresseliste = ({ adressetype, adresser }: AdresselisteProps) => {
  const gyldigeAdresser = adresser.filter((adresse) => !adresse.erHistorisk);
  const historiskeAdresser = adresser.filter((adresse) => adresse.erHistorisk);

  return (
    <>
      <ExpandableList
        elements={gyldigeAdresser}
        header={<Adresseheader adressetype={adressetype} />}
        idFromElement={() => Utils._uuid()}
        renderElement={(adresse) => (
          <Adresserad
            kolonner={[
              {
                innhold: renderAdressekomponent(adresse),
                bredde: "3",
              },
              {
                innhold: adresse.master,
                bredde: "3",
              },
              {
                innhold: adresse.kilde,
                bredde: "3",
              },
              {
                innhold: adresse.gyldigFraOgMed,
                bredde: "3",
              },
            ]}
          />
        )}
        amountOfItemsCollapsed={adresser.length}
        chevron
        dividers
      />
      <ExpandableList
        elements={historiskeAdresser}
        header={<Adresseheader adressetype={adressetype} visTom />}
        showHeader={(collapsed) => !collapsed}
        idFromElement={() => Utils._uuid()}
        renderElement={(adresse) => (
          <Adresserad
            kolonner={[
              {
                innhold: renderAdressekomponent(adresse),
                bredde: "3",
              },
              {
                innhold: adresse.master,
                bredde: "3",
              },
              {
                innhold: adresse.kilde,
                bredde: "3",
              },
              {
                innhold: (
                  <>
                    {adresse.gyldigFraOgMed} - {adresse.gyldigTilOgMed}
                  </>
                ),
                bredde: "3",
              },
            ]}
          />
        )}
        amountOfItemsCollapsed={0}
        dividers
        chevron
      />
    </>
  );
};

export { Adressetype };
export default Adresseliste;
