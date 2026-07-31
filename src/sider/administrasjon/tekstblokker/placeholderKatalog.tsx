import { BodyShort, Heading, ReadMore } from "@navikt/ds-react";

import * as Nav from "../../../navFrontend";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../../featuretoggle/toggleNavn";
import { useBetingelseKatalog, usePlaceholderKatalog } from "../../../services/api/placeholdere";
import { BetingelseBeskrivelse, PlaceholderBeskrivelse } from "../../../services/modules/placeholdere";

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

// Valgtokener står ikke i katalogtabellen – syntaksen må derfor forklares der admin
// leter etter placeholdere, både i seksjonen og i redigeringsmodalen.
export function PlaceholderValgHjelpetekst() {
  return (
    <BodyShort spacing size="small">
      Faste alternativer skrives {"{velg:Alternativ A|Alternativ B}"} – saksbehandler velger ved klikk i brevet.
    </BodyShort>
  );
}

// Betingelsene har ingen eksempelverdi – de styrer om innholdet tas med, ikke hva som vises.
export function BetingelseKatalogTabell({ betingelser }: { betingelser: BetingelseBeskrivelse[] }) {
  return (
    <Nav.Table className="tekstblokker__placeholder-tabell">
      <Nav.Table.Header>
        <Nav.Table.Row>
          <Nav.Table.HeaderCell scope="col">Navn</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Nøkkel</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Beskrivelse</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {betingelser.map(({ nokkel, visningsnavn, beskrivelse }) => (
          <Nav.Table.Row key={nokkel}>
            <Nav.Table.DataCell>{visningsnavn}</Nav.Table.DataCell>
            <Nav.Table.DataCell>
              <code className="tekstblokker__placeholder-nokkel">{`{#hvis ${nokkel}}`}</code>
            </Nav.Table.DataCell>
            <Nav.Table.DataCell>{beskrivelse}</Nav.Table.DataCell>
          </Nav.Table.Row>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
}

export function PlaceholderBetingelseHjelpetekst() {
  return (
    <BodyShort spacing size="small">
      Betinget innhold skrives {"{#hvis nokkel}"} … {"{/hvis}"} – innholdet mellom tokenene blir bare med når
      betingelsen er oppfylt. Står tokenene i hvert sitt avsnitt, styrer de hele avsnitt; står de i samme avsnitt,
      styrer de teksten imellom.
    </BodyShort>
  );
}

function PlaceholderKatalog() {
  const togglePaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  if (!togglePaa) return null;
  return <PlaceholderKatalogInnhold />;
}

function PlaceholderKatalogInnhold() {
  const { data: placeholdere = [], error } = usePlaceholderKatalog();
  // Eldre api uten betingelser gir tom liste, og seksjonen uteblir.
  const { data: betingelser = [] } = useBetingelseKatalog();

  // Hjelpevisning: feiler hentingen, eller er katalogen tom, skjuler vi seksjonen stille.
  if (error || placeholdere.length === 0) return null;

  return (
    <div className="tekstblokker__placeholder-katalog">
      <ReadMore header="Tilgjengelige placeholdere">
        <BodyShort spacing size="small">
          Skriv nøkkelen i krøllparenteser i teksten, f.eks. {"{saksnummer}"}. Den erstattes med verdien fra saken når
          brevet lages. Klammer som {"[skriv begrunnelse]"} betyr fortsatt at saksbehandler fyller ut selv.
        </BodyShort>
        <PlaceholderValgHjelpetekst />
        <PlaceholderKatalogTabell placeholdere={placeholdere} />
        {betingelser.length > 0 && (
          <>
            <Heading size="xsmall" level="3" spacing>
              Betingelser
            </Heading>
            <PlaceholderBetingelseHjelpetekst />
            <BetingelseKatalogTabell betingelser={betingelser} />
          </>
        )}
      </ReadMore>
    </div>
  );
}

export default PlaceholderKatalog;
