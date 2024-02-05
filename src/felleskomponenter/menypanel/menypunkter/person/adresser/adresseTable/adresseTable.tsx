import { useState } from "react";

import * as Utils from "../../../../../../utils";

import { Bostedsadresse, Kontaktadresse, Oppholdsadresse } from "../../../../../../graphql";
import { SemistrukturertAdresse, StrukturertAdresse } from "../../../../../adresser";
import ChevronKnapp from "../../../../../chevronKnapp/chevronKnapp";
import { Table } from "@navikt/ds-react";

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
        <Table className="menypanel__table">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className={`fixed-width ${historisk ? "transparent" : ""}`}>
                {adressetype}
              </Table.HeaderCell>
              <Table.HeaderCell className={historisk ? "transparent" : ""}>Register</Table.HeaderCell>
              <Table.HeaderCell className={historisk ? "transparent" : ""}>Kilde</Table.HeaderCell>
              <Table.HeaderCell className="fixed-width">{periodetekst}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {adresser.map((adresse) => (
              <Table.Row key={Utils._uuid()}>
                <Table.DataCell>{renderAdressekomponent(adresse)}</Table.DataCell>
                <Table.DataCell>{adresse.master}</Table.DataCell>
                <Table.DataCell>{adresse.kilde}</Table.DataCell>
                <Table.DataCell className={historisk ? "historisk-label" : "gyldig-label"}>
                  {renderPeriode(adresse, historisk)}
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
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
