import React, { useState } from "react";

import * as Utils from "../../../../../../utils";

import { Bostedsadresse, Kontaktadresse, Oppholdsadresse } from "../../../../../../graphql";
import { SemistrukturertAdresse, StrukturertAdresse } from "../../../../../adresser";
import ChevronKnapp from "../../../../../chevronKnapp/chevronKnapp";

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

const renderPeriode = (adresse: Adresse, historisk?: boolean) => {
  if (historisk) {
    return `${adresse.gyldigFraOgMed ? Utils.dato.formatterDatoTilNorsk(adresse.gyldigFraOgMed) : ""} - ${
      adresse.gyldigTilOgMed ? Utils.dato.formatterDatoTilNorsk(adresse.gyldigTilOgMed) : ""
    }`;
  }
  return adresse.gyldigFraOgMed ? Utils.dato.formatterDatoTilNorsk(adresse.gyldigFraOgMed) : "";
};

interface AdresseTableProps {
  adressetype: string;
  adresser: Adresse[];
  historisk?: boolean;
}

const AdresseTable = ({ adressetype, adresser, historisk }: AdresseTableProps) => {
  const [expanded, setExpanded] = useState(false);
  const periodetekst = `Gyldig f.o.m.${historisk ? " - t.o.m." : ""}`;

  return (
    <div className="adresseTable menypanel__table-wrapper">
      {!historisk || expanded ? (
        <table className="menypanel__table">
          <tbody>
            <tr className="header">
              <th className={`fixed-width ${historisk ? "transparent" : ""}`}>{adressetype}</th>
              <th className={historisk ? "transparent" : ""}>Register</th>
              <th className={historisk ? "transparent" : ""}>Kilde</th>
              <th className="fixed-width">{periodetekst}</th>
            </tr>
            {adresser.map((adresse) => (
              <tr key={Utils._uuid()}>
                <td>{renderAdressekomponent(adresse)}</td>
                <td>{adresse.master}</td>
                <td>{adresse.kilde}</td>
                <td className={historisk ? "historisk-label" : "gyldig-label"}>{renderPeriode(adresse, historisk)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {historisk && (
        <ChevronKnapp
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          label={expanded ? "Lukk historikk" : "Åpne historikk"}
        />
      )}
    </div>
  );
};

export default AdresseTable;
