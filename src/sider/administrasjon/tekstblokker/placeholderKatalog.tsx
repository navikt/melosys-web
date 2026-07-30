import { BodyShort, ReadMore } from "@navikt/ds-react";

import * as Nav from "../../../navFrontend";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../../featuretoggle/toggleNavn";
import { usePlaceholderKatalog } from "../../../services/api/placeholdere";
import { PlaceholderBeskrivelse } from "../../../services/modules/placeholdere";

interface Props {
  placeholdere: PlaceholderBeskrivelse[];
}

// Ren visning over katalogen, uten henting – gjenbrukes i redigeringsmodalen senere.
export function PlaceholderKatalogTabell({ placeholdere }: Props) {
  return (
    <Nav.Table className="tekstblokker__placeholder-tabell">
      <Nav.Table.Header>
        <Nav.Table.Row>
          <Nav.Table.HeaderCell scope="col">Navn</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Nøkkel</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Beskrivelse</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Eksempel</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {placeholdere.map(({ nokkel, visningsnavn, beskrivelse, eksempel }) => (
          <Nav.Table.Row key={nokkel}>
            <Nav.Table.DataCell>{visningsnavn}</Nav.Table.DataCell>
            <Nav.Table.DataCell>
              <code className="tekstblokker__placeholder-nokkel">{`{${nokkel}}`}</code>
            </Nav.Table.DataCell>
            <Nav.Table.DataCell>{beskrivelse}</Nav.Table.DataCell>
            <Nav.Table.DataCell>{eksempel}</Nav.Table.DataCell>
          </Nav.Table.Row>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
}

function PlaceholderKatalog() {
  const togglePaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  if (!togglePaa) return null;
  return <PlaceholderKatalogInnhold />;
}

function PlaceholderKatalogInnhold() {
  const { data: placeholdere = [], error } = usePlaceholderKatalog();

  // Hjelpevisning: feiler hentingen, eller er katalogen tom, skjuler vi seksjonen stille.
  if (error || placeholdere.length === 0) return null;

  return (
    <div className="tekstblokker__placeholder-katalog">
      <ReadMore header="Tilgjengelige placeholdere">
        <BodyShort spacing size="small">
          Skriv nøkkelen med klammeparenteser i teksten. Den erstattes med verdien fra saken når brevet lages.
        </BodyShort>
        <PlaceholderKatalogTabell placeholdere={placeholdere} />
      </ReadMore>
    </div>
  );
}

export default PlaceholderKatalog;
