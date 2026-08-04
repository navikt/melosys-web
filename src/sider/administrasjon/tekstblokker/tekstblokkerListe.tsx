import { ClockDashedIcon, CheckmarkCircleIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { useState } from "react";

import * as Nav from "../../../navFrontend";
import TekstblokkForhandsvisning from "../../../felleskomponenter/htmlEditor/tekstblokkForhandsvisning";
import { TekstblokkOversikt } from "../../../services/modules/tekstblokker";
import { formatterDatoTilNorsk } from "../../../utils/dato";
import { termForBehandlingstema, termForSakstype } from "./kontekstavgrensning";
import TekstblokkHistorikk from "./tekstblokkHistorikk";

// Kolonnen skal kunne leses på et blikk; resten samles i én «+N»-tag som åpner raden.
const MAKS_SYNLIGE_TERMER = 1;

const gjelderTermer = (blokk: TekstblokkOversikt): Array<{ noekkel: string; term: string }> => [
  ...blokk.sakstyper.map((kode) => ({ noekkel: `sakstype-${kode}`, term: termForSakstype(kode) })),
  ...blokk.behandlingstemaer.map((kode) => ({
    noekkel: `behandlingstema-${kode}`,
    term: termForBehandlingstema(kode),
  })),
];

interface Props {
  blokker: TekstblokkOversikt[];
  utvidedeIder: Set<number>;
  onToggleUtvidet: (id: number) => void;
  onRediger: (id: number) => void;
  onSlett: (blokk: TekstblokkOversikt) => void;
  onPubliser: (blokk: TekstblokkOversikt) => void;
}

function TekstblokkerListe({ blokker, utvidedeIder, onToggleUtvidet, onRediger, onSlett, onPubliser }: Props) {
  // Historikken deler den utvidbare raden med forhåndsvisningen, så bare én av dem vises av gangen.
  const [historikkId, setHistorikkId] = useState<number | null>(null);

  const toggleHistorikk = (id: number) => {
    setHistorikkId(historikkId === id ? null : id);
    if (!utvidedeIder.has(id)) onToggleUtvidet(id);
  };

  // Lukkes raden, står ikke historikkvalget ved lag: neste åpning viser forhåndsvisningen.
  const toggleUtvidet = (id: number) => {
    if (utvidedeIder.has(id) && historikkId === id) setHistorikkId(null);
    onToggleUtvidet(id);
  };

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
          <Nav.Table.HeaderCell scope="col">Gjelder</Nav.Table.HeaderCell>
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
            visHistorikk={historikkId === blokk.id}
            onToggleUtvidet={toggleUtvidet}
            onToggleHistorikk={toggleHistorikk}
            onRediger={onRediger}
            onSlett={onSlett}
            onPubliser={onPubliser}
          />
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
}

interface RadProps {
  blokk: TekstblokkOversikt;
  utvidet: boolean;
  visHistorikk: boolean;
  onToggleUtvidet: (id: number) => void;
  onToggleHistorikk: (id: number) => void;
  onRediger: (id: number) => void;
  onSlett: (blokk: TekstblokkOversikt) => void;
  onPubliser: (blokk: TekstblokkOversikt) => void;
}

function TekstblokkerListeRad({
  blokk,
  utvidet,
  visHistorikk,
  onToggleUtvidet,
  onToggleHistorikk,
  onRediger,
  onSlett,
  onPubliser,
}: RadProps) {
  const termer = gjelderTermer(blokk);
  const skjulteTermer = termer.slice(MAKS_SYNLIGE_TERMER).map(({ term }) => term);

  return (
    <Nav.Table.ExpandableRow
      open={utvidet}
      onOpenChange={() => onToggleUtvidet(blokk.id)}
      togglePlacement="left"
      content={
        <div className="tekstblokker__rad-forhandsvisning">
          {termer.length > 0 && (
            <div className="tekstblokker__rad-gjelder">
              <Nav.BodyShort size="small" textColor="subtle">
                Gjelder:
              </Nav.BodyShort>
              {termer.map(({ noekkel, term }) => (
                <Nav.Tag key={noekkel} size="xsmall" variant="info">
                  {term}
                </Nav.Tag>
              ))}
            </div>
          )}
          {visHistorikk ? <TekstblokkHistorikk id={blokk.id} /> : <TekstblokkForhandsvisning html={blokk.innhold} />}
        </div>
      }
    >
      <Nav.Table.DataCell>
        <div className="tekstblokker__rad-tittel-celle">
          <button type="button" className="tekstblokker__rad-tittel" onClick={() => onRediger(blokk.id)}>
            {blokk.tittel}
          </button>
          {blokk.status === "UTKAST" && (
            <Nav.Tag size="xsmall" variant="warning">
              Utkast
            </Nav.Tag>
          )}
        </div>
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
      {/* Avgrensningen står i egen kolonne, ikke skilt fra tagene på farge alene (WCAG 1.4.1). */}
      <Nav.Table.DataCell>
        <div className="tekstblokker__rad-tags">
          {termer.slice(0, MAKS_SYNLIGE_TERMER).map(({ noekkel, term }) => (
            <Nav.Tag key={noekkel} size="xsmall" variant="info">
              {term}
            </Nav.Tag>
          ))}
          {skjulteTermer.length > 0 && (
            <button
              type="button"
              className="tekstblokker__gjelder-mer"
              title={skjulteTermer.join(", ")}
              aria-label={skjulteTermer.join(", ")}
              // stopPropagation: raden skal ikke også reagere på klikket om den senere gjøres klikkbar.
              // Knappen åpner bare: på en åpen rad står termene allerede der, og et klikk som
              // lukket dem ville tatt bort nettopp det brukeren ba om å få se.
              onClick={(e) => {
                e.stopPropagation();
                if (!utvidet) onToggleUtvidet(blokk.id);
              }}
            >
              <Nav.Tag size="xsmall" variant="info">
                {`+${skjulteTermer.length}`}
              </Nav.Tag>
            </button>
          )}
          {termer.length === 0 && (
            <Nav.BodyShort size="small" textColor="subtle">
              Alle
            </Nav.BodyShort>
          )}
        </div>
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>{formatterDatoTilNorsk(blokk.endretDato, true)}</Nav.Table.DataCell>
      <Nav.Table.DataCell>{blokk.endretAvNavn ?? blokk.endretAv}</Nav.Table.DataCell>
      <Nav.Table.DataCell>
        <div className="tekstblokker__rad-handlinger">
          {blokk.status === "UTKAST" && (
            <Nav.Button
              size="xsmall"
              variant="tertiary"
              icon={<CheckmarkCircleIcon aria-hidden />}
              onClick={() => onPubliser(blokk)}
            >
              Publiser
            </Nav.Button>
          )}
          <Nav.Button
            size="xsmall"
            variant="tertiary"
            icon={<ClockDashedIcon aria-hidden />}
            aria-pressed={visHistorikk}
            onClick={() => onToggleHistorikk(blokk.id)}
          >
            Historikk
          </Nav.Button>
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
