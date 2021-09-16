import React from "react";

import * as Utils from "../../../../../../utils";

import { Bostedsadresse } from "../../../../../../graphql";

import ExpandableList from "../../../../../expandablelist";
import { StrukturertAdresse } from "../../../../../adresser";
import Adresseheader, { Adressetype } from "../adresseheader";
import Adresserad from "../adresserad";

interface BostedsadresserProps {
  bostedsadresser: Bostedsadresse[];
}

const Bostedsadresser = ({ bostedsadresser }: BostedsadresserProps) => {
  const gyldigeBostedsadresser = bostedsadresser.filter((adresse) => !adresse.erHistorisk);
  const historiskeBostedsadresser = bostedsadresser.filter((adresse) => adresse.erHistorisk);

  return (
    <>
      <ExpandableList
        elements={gyldigeBostedsadresser}
        header={<Adresseheader adressetype={Adressetype.Bostedsadresse} />}
        idFromElement={() => Utils._uuid()}
        renderElement={(adresse) => (
          <Adresserad
            kolonner={[
              {
                innhold: <StrukturertAdresse adresse={adresse.adresse} />,
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
        amountOfItemsCollapsed={bostedsadresser.length}
        chevron
        dividers
      />
      <ExpandableList
        elements={historiskeBostedsadresser}
        header={<Adresseheader adressetype={Adressetype.Bostedsadresse} visTom />}
        idFromElement={() => Utils._uuid()}
        renderElement={(adresse) => (
          <Adresserad
            kolonner={[
              {
                innhold: <StrukturertAdresse adresse={adresse.adresse} />,
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

export default Bostedsadresser;
