import React from "react";

import * as Utils from "../../../../../../utils";

import { Bostedsadresse, Oppholdsadresse, Kontaktadresse } from "../../../../../../graphql";

import ExpandableList from "../../../../../expandablelist";
import { StrukturertAdresse, SemistrukturertAdresse } from "../../../../../adresser";
import Adresseheader, { Adressetype } from "../adresseheader";
import Adresserad, { Farge } from "../adresserad";

type Adresse = Bostedsadresse | Oppholdsadresse | Kontaktadresse;

function isKontaktAdresse(adresse: Adresse): adresse is Kontaktadresse {
  return (adresse as Kontaktadresse).semistrukturertAdresse !== undefined;
}

const renderAdressekomponent = (adresse: Adresse) => {
  if (isKontaktAdresse(adresse)) {
    if (adresse.strukturertAdresse)
      return (
        <StrukturertAdresse
          adresse={{
            ...adresse.strukturertAdresse,
            landkode: adresse.strukturertAdresse.land,
            coAdressenavn: adresse.coAdressenavn,
          }}
        />
      );
    if (adresse.semistrukturertAdresse) return <SemistrukturertAdresse adresse={adresse.semistrukturertAdresse} />;
    return null;
  }

  return (
    <StrukturertAdresse
      adresse={{ ...adresse.adresse, landkode: adresse.adresse.land, coAdressenavn: adresse.coAdressenavn }}
    />
  );
};

interface AdresselisteProps {
  adressetype: Adressetype;
  adresser: Adresse[];
}

const Adresseliste = ({ adressetype, adresser }: AdresselisteProps) => {
  const gyldigeAdresser = adresser.filter((adresse) => !adresse.erHistorisk);
  const historiskeAdresser = adresser.filter((adresse) => adresse.erHistorisk);

  return (
    <div className="adresseliste">
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
                innhold: Utils.dato.formatterDatoTilNorsk(adresse.gyldigFraOgMed),
                bredde: "3",
                tekstfarge: Farge.Groenn,
              },
            ]}
          />
        )}
        amountOfItemsCollapsed={adresser.length}
        btnTextCollapsed="Åpne historikk"
        btnTextExpanded="Lukk historikk"
        chevron
        dividers
      />
      <ExpandableList
        elements={historiskeAdresser}
        header={<Adresseheader adressetype={adressetype} visBareFomTom />}
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
                innhold: `${adresse.gyldigFraOgMed ? Utils.dato.formatterDatoTilNorsk(adresse.gyldigFraOgMed) : ""} - ${
                  adresse.gyldigTilOgMed ? Utils.dato.formatterDatoTilNorsk(adresse.gyldigTilOgMed) : ""
                }`,
                bredde: "3",
                tekstfarge: Farge.Roed,
              },
            ]}
          />
        )}
        amountOfItemsCollapsed={0}
        btnTextCollapsed="Åpne historikk"
        btnTextExpanded="Lukk historikk"
        dividers
        chevron
      />
    </div>
  );
};

export { Adressetype };
export default Adresseliste;
