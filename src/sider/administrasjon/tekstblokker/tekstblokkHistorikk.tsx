import moment from "moment";

import * as Nav from "../../../navFrontend";
import TekstblokkForhandsvisning from "../../../felleskomponenter/htmlEditor/tekstblokkForhandsvisning";
import { useTekstblokkHistorikk } from "../../../services/api/tekstblokker";
import { TekstblokkVersjon } from "../../../services/modules/tekstblokker";
import { labelForEndringstype } from "./labels";

// gyldigFra/gyldigTil er LocalDateTime fra api-et – allerede norsk tid, så ingen soneomregning.
const formatterTidspunkt = (tidspunkt: string): string => moment(tidspunkt).format("DD.MM.YYYY HH:mm");

const tidsrom = (versjon: TekstblokkVersjon): string =>
  `${formatterTidspunkt(versjon.gyldigFra)} – ${versjon.gyldigTil ? formatterTidspunkt(versjon.gyldigTil) : "nå"}`;

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
        {[...versjoner].reverse().map((versjon) => (
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
            <Nav.Table.DataCell>{labelForEndringstype(versjon.endringstype)}</Nav.Table.DataCell>
          </Nav.Table.ExpandableRow>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
}

export default TekstblokkHistorikk;
