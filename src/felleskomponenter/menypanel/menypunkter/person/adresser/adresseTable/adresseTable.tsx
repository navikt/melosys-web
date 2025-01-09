import { useState } from "react";

import * as Utils from "../../../../../../utils";
import * as Nav from "../../../../../../navFrontend";

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

function AdresseTable({ adressetype, adresser, historisk }: AdresseTableProps) {
  const [expanded, setExpanded] = useState(false);
  const periodetekst = `Gyldig f.o.m.${historisk ? " - t.o.m." : ""}`;

  return (
    <div className="adresseTable menypanel__table-wrapper">
      {!historisk || expanded ? (
        <Nav.Table className="menypanel__table">
          <Nav.Table.Header>
            <Nav.Table.Row>
              <Nav.Table.HeaderCell className={`fixed-width ${historisk ? "transparent" : ""}`}>
                {adressetype}
              </Nav.Table.HeaderCell>
              <Nav.Table.HeaderCell className={historisk ? "transparent" : ""}>Register</Nav.Table.HeaderCell>
              <Nav.Table.HeaderCell className={historisk ? "transparent" : ""}>Kilde</Nav.Table.HeaderCell>
              <Nav.Table.HeaderCell className="fixed-width">{periodetekst}</Nav.Table.HeaderCell>
            </Nav.Table.Row>
          </Nav.Table.Header>
          <Nav.Table.Body>
            {adresser.map((adresse) => (
              <Nav.Table.Row key={Utils._uuid()}>
                <Nav.Table.DataCell>{renderAdressekomponent(adresse)}</Nav.Table.DataCell>
                <Nav.Table.DataCell>{adresse.master}</Nav.Table.DataCell>
                <Nav.Table.DataCell>{adresse.kilde}</Nav.Table.DataCell>
                <Nav.Table.DataCell className={historisk ? "historisk-label" : "gyldig-label"}>
                  {renderPeriode(adresse, historisk)}
                </Nav.Table.DataCell>
              </Nav.Table.Row>
            ))}
          </Nav.Table.Body>
        </Nav.Table>
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
}

export default AdresseTable;
