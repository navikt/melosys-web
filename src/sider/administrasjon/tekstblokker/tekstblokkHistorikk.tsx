import moment from "moment";

import * as Nav from "../../../navFrontend";
import TekstblokkForhandsvisning from "../../../felleskomponenter/htmlEditor/tekstblokkForhandsvisning";
import { useTekstblokkHistorikk } from "../../../services/api/tekstblokker";
import { TekstblokkVersjon } from "../../../services/modules/tekstblokker";
import { termForBehandlingstema, termForSakstema, termForSakstype } from "./kontekstavgrensning";
import { labelForEndringstype, labelForStatus } from "./labels";

// gyldigFra/gyldigTil er LocalDateTime fra api-et – allerede norsk tid, så ingen soneomregning.
const formatterTidspunkt = (tidspunkt: string): string => moment(tidspunkt).format("DD.MM.YYYY HH:mm");

const tidsrom = (versjon: TekstblokkVersjon): string =>
  `${formatterTidspunkt(versjon.gyldigFra)} – ${versjon.gyldigTil ? formatterTidspunkt(versjon.gyldigTil) : "nå"}`;

// Rekkefølgen i listene er uten betydning for hva blokken gjelder.
const likeLister = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  const [sortertA, sortertB] = [[...a].sort(), [...b].sort()];
  return sortertA.every((verdi, indeks) => verdi === sortertB[indeks]);
};

interface Listediff {
  lagtTil: string[];
  fjernet: string[];
}

const listediff = (ny: string[], gammel: string[], term: (kode: string) => string): Listediff => ({
  lagtTil: ny.filter((kode) => !gammel.includes(kode)).map(term),
  fjernet: gammel.filter((kode) => !ny.includes(kode)).map(term),
});

// U+2212, ikke bindestrek: fortegnet skal lese som motstykket til «+».
const MINUS = "−";

// «avgrensning (+Arbeid kun i Norge, −EU/EØS-land)» – lagt til før fjernet, på tvers av listene.
const medDetaljer = (felt: string, differ: Listediff[]): string => {
  const detaljer = [
    ...differ.flatMap(({ lagtTil }) => lagtTil).map((term) => `+${term}`),
    ...differ.flatMap(({ fjernet }) => fjernet).map((term) => `${MINUS}${term}`),
  ];
  return detaljer.length > 0 ? `${felt} (${detaljer.join(", ")})` : felt;
};

const endredeFelter = (versjon: TekstblokkVersjon, forrige?: TekstblokkVersjon): string[] => {
  if (!forrige) return [];
  const endringer: string[] = [];
  if (versjon.tittel !== forrige.tittel) endringer.push("tittel");
  if (versjon.innhold !== forrige.innhold) endringer.push("innhold");
  if (!likeLister(versjon.tags, forrige.tags))
    endringer.push(medDetaljer("tags", [listediff(versjon.tags, forrige.tags, (tag) => tag)]));
  if (
    !likeLister(versjon.sakstyper, forrige.sakstyper) ||
    !likeLister(versjon.sakstemaer, forrige.sakstemaer) ||
    !likeLister(versjon.behandlingstemaer, forrige.behandlingstemaer)
  )
    endringer.push(
      medDetaljer("avgrensning", [
        listediff(versjon.sakstyper, forrige.sakstyper, termForSakstype),
        listediff(versjon.sakstemaer, forrige.sakstemaer, termForSakstema),
        listediff(versjon.behandlingstemaer, forrige.behandlingstemaer, termForBehandlingstema),
      ]),
    );
  if (versjon.status !== forrige.status)
    endringer.push(`status (${labelForStatus(forrige.status)} → ${labelForStatus(versjon.status)})`);
  return endringer;
};

interface Props {
  id: number;
}

function TekstblokkHistorikk({ id }: Props) {
  const { data: versjoner = [], isLoading, error } = useTekstblokkHistorikk(id);

  if (isLoading) return <Nav.Loader />;

  if (error) {
    return (
      <Nav.Alert variant="error" size="small">
        Kunne ikke hente historikk: {error.message}
      </Nav.Alert>
    );
  }

  if (versjoner.length === 0) {
    return <Nav.BodyShort size="small">Ingen versjonshistorikk registrert for denne blokken.</Nav.BodyShort>;
  }

  const nyesteForst = [...versjoner].reverse();
  // Neste rad er den eldre versjonen, siden lista står nyeste først.
  const rader = nyesteForst.map((versjon, indeks) => ({
    versjon,
    endringer: endredeFelter(versjon, nyesteForst[indeks + 1]),
  }));

  return (
    <Nav.Table size="small" className="tekstblokker__historikk">
      <Nav.Table.Header>
        <Nav.Table.Row>
          <Nav.Table.HeaderCell scope="col" aria-label="Utvid" />
          <Nav.Table.HeaderCell scope="col">Versjon</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Gyldig</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Endret av</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Endring</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {/* Nyeste først: den gjeldende versjonen er den admin oftest sammenligner mot. */}
        {rader.map(({ versjon, endringer }) => (
          <Nav.Table.ExpandableRow
            key={versjon.versjon}
            togglePlacement="left"
            content={
              <div className="tekstblokker__historikk-innhold">
                <Nav.BodyShort size="small">{versjon.tittel}</Nav.BodyShort>
                <TekstblokkForhandsvisning html={versjon.innhold} />
              </div>
            }
          >
            <Nav.Table.DataCell>{versjon.versjon}</Nav.Table.DataCell>
            <Nav.Table.DataCell>{tidsrom(versjon)}</Nav.Table.DataCell>
            <Nav.Table.DataCell>{versjon.endretAvNavn ?? versjon.endretAv}</Nav.Table.DataCell>
            <Nav.Table.DataCell>
              {labelForEndringstype(versjon.endringstype)}
              {endringer.length > 0 && (
                <Nav.BodyShort size="small" textColor="subtle">
                  {`Endret: ${endringer.join(", ")}`}
                </Nav.BodyShort>
              )}
            </Nav.Table.DataCell>
          </Nav.Table.ExpandableRow>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
}

export default TekstblokkHistorikk;
