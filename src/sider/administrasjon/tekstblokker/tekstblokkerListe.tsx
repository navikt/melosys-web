import { Button, Table, Tag } from "@navikt/ds-react";
import { PencilIcon, TrashIcon } from "@navikt/aksel-icons";

import { TekstblokkOversikt } from "../../../services/modules/tekstblokker";

interface Props {
  blokker: TekstblokkOversikt[];
  onRediger: (id: number) => void;
  onSlett: (blokk: TekstblokkOversikt) => void;
}

function TekstblokkerListe({ blokker, onRediger, onSlett }: Props) {
  if (blokker.length === 0) {
    return (
      <div className="tekstblokker__tom">
        <p>Ingen tekstblokker matcher filteret.</p>
      </div>
    );
  }

  return (
    <Table size="small" className="tekstblokker__tabell">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col">Tittel</Table.HeaderCell>
          <Table.HeaderCell scope="col">Tags</Table.HeaderCell>
          <Table.HeaderCell scope="col">Sist endret</Table.HeaderCell>
          <Table.HeaderCell scope="col">Av</Table.HeaderCell>
          <Table.HeaderCell scope="col" aria-label="Handlinger" />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {blokker.map((blokk) => (
          <Table.Row key={blokk.id}>
            <Table.DataCell>
              <button type="button" className="tekstblokker__rad-tittel" onClick={() => onRediger(blokk.id)}>
                {blokk.tittel}
              </button>
            </Table.DataCell>
            <Table.DataCell>
              <div className="tekstblokker__rad-tags">
                {blokk.tags.map((tag) => (
                  <Tag key={tag} size="xsmall" variant="neutral">
                    {tag}
                  </Tag>
                ))}
              </div>
            </Table.DataCell>
            <Table.DataCell>{formaterDato(blokk.endretDato)}</Table.DataCell>
            <Table.DataCell>{blokk.endretAv}</Table.DataCell>
            <Table.DataCell>
              <div className="tekstblokker__rad-handlinger">
                <Button
                  size="xsmall"
                  variant="tertiary"
                  icon={<PencilIcon aria-hidden />}
                  onClick={() => onRediger(blokk.id)}
                >
                  Rediger
                </Button>
                <Button
                  size="xsmall"
                  variant="tertiary-neutral"
                  icon={<TrashIcon aria-hidden />}
                  onClick={() => onSlett(blokk)}
                >
                  Slett
                </Button>
              </div>
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

const formaterDato = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("nb-NO", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
};

export default TekstblokkerListe;
