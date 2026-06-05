import { PencilIcon, TrashIcon } from "@navikt/aksel-icons";

import * as Nav from "../../../navFrontend";
import TekstblokkForhandsvisning from "../../../felleskomponenter/htmlEditor/tekstblokkForhandsvisning";
import { TekstblokkOversikt } from "../../../services/modules/tekstblokker";
import { formatterDatoTilNorsk } from "../../../utils/dato";

interface Props {
  blokker: TekstblokkOversikt[];
  utvidedeIder: Set<number>;
  onToggleUtvidet: (id: number) => void;
  onRediger: (id: number) => void;
  onSlett: (blokk: TekstblokkOversikt) => void;
}

function TekstblokkerListe({ blokker, utvidedeIder, onToggleUtvidet, onRediger, onSlett }: Props) {
  if (blokker.length === 0) {
    return (
      <div className="tekstblokker__tom">
        <p>Ingen tekstblokker matcher filteret.</p>
      </div>
    );
  }

  return (
    <Nav.Table className="tekstblokker__tabell">
      <Nav.Table.Header>
        <Nav.Table.Row>
          <Nav.Table.HeaderCell scope="col" aria-label="Utvid" />
          <Nav.Table.HeaderCell scope="col">Tittel</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Tags</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Sist endret</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Av</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col" aria-label="Handlinger" />
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {blokker.map((blokk) => (
          <TekstblokkerListeRad
            key={blokk.id}
            blokk={blokk}
            utvidet={utvidedeIder.has(blokk.id)}
            onToggleUtvidet={onToggleUtvidet}
            onRediger={onRediger}
            onSlett={onSlett}
          />
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
}

interface RadProps {
  blokk: TekstblokkOversikt;
  utvidet: boolean;
  onToggleUtvidet: (id: number) => void;
  onRediger: (id: number) => void;
  onSlett: (blokk: TekstblokkOversikt) => void;
}

function TekstblokkerListeRad({ blokk, utvidet, onToggleUtvidet, onRediger, onSlett }: RadProps) {
  return (
    <Nav.Table.ExpandableRow
      open={utvidet}
      onOpenChange={() => onToggleUtvidet(blokk.id)}
      togglePlacement="left"
      content={
        <div className="tekstblokker__rad-forhandsvisning">
          <TekstblokkForhandsvisning html={blokk.innhold} />
        </div>
      }
    >
      <Nav.Table.DataCell>
        <button type="button" className="tekstblokker__rad-tittel" onClick={() => onRediger(blokk.id)}>
          {blokk.tittel}
        </button>
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>
        <div className="tekstblokker__rad-tags">
          {blokk.tags.map((tag) => (
            <Nav.Tag key={tag} size="xsmall" variant="neutral">
              {tag}
            </Nav.Tag>
          ))}
        </div>
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>{formatterDatoTilNorsk(blokk.endretDato, true)}</Nav.Table.DataCell>
      <Nav.Table.DataCell>{blokk.endretAv}</Nav.Table.DataCell>
      <Nav.Table.DataCell>
        <div className="tekstblokker__rad-handlinger">
          <Nav.Button
            size="xsmall"
            variant="tertiary"
            icon={<PencilIcon aria-hidden />}
            onClick={() => onRediger(blokk.id)}
          >
            Rediger
          </Nav.Button>
          <Nav.Button
            size="xsmall"
            variant="tertiary-neutral"
            icon={<TrashIcon aria-hidden />}
            onClick={() => onSlett(blokk)}
          >
            Slett
          </Nav.Button>
        </div>
      </Nav.Table.DataCell>
    </Nav.Table.ExpandableRow>
  );
}

export default TekstblokkerListe;
