import * as Nav from "../../navFrontend";
import { useSlettTekstblokk } from "../../services/api/tekstblokker";
import { TekstblokkOversikt } from "../../services/modules/tekstblokker";
import { labelForType } from "./labels";

interface Props {
  blokk: TekstblokkOversikt | null;
  onLukk: () => void;
}

function TekstblokkSlettBekreftelse({ blokk, onLukk }: Props) {
  const slett = useSlettTekstblokk();

  if (!blokk) return null;

  const handleSlett = () => slett.mutate(blokk.id, { onSuccess: onLukk });
  const typeLabel = labelForType(blokk.type);

  return (
    <Nav.Modal open onClose={onLukk} aria-label="Bekreft sletting" width="small">
      <Nav.Modal.Header>
        <Nav.Heading size="small" level="1">
          Slette {typeLabel}?
        </Nav.Heading>
      </Nav.Modal.Header>
      <Nav.Modal.Body>
        <Nav.BodyLong>
          Er du sikker på at du vil slette «<strong>{blokk.tittel}</strong>»? <br />
          <br />
          {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1) + "en"} blir permanent slettet og kan ikke
          gjenopprettes.
        </Nav.BodyLong>
        {slett.error && (
          <Nav.Alert variant="error" size="small" style={{ marginTop: "0.75rem" }}>
            Kunne ikke slette: {slett.error.message}
          </Nav.Alert>
        )}
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Nav.Button variant="danger" onClick={handleSlett} loading={slett.isPending}>
          Slett
        </Nav.Button>
        <Nav.Button variant="tertiary" onClick={onLukk} disabled={slett.isPending}>
          Avbryt
        </Nav.Button>
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
}

export default TekstblokkSlettBekreftelse;
