import * as Nav from "../../navFrontend";
import { usePubliserTekstblokk } from "../../services/api/tekstblokker";
import { TekstblokkOversikt } from "../../services/modules/tekstblokker";
import { labelForType } from "./labels";

interface Props {
  blokk: TekstblokkOversikt | null;
  onLukk: () => void;
}

function TekstblokkPubliserBekreftelse({ blokk, onLukk }: Props) {
  const publiser = usePubliserTekstblokk();

  if (!blokk) return null;

  // Komponenten lever videre mellom åpningene; uten nullstilling vises forrige feil på nytt.
  const handleLukk = () => {
    publiser.reset();
    onLukk();
  };

  const handlePubliser = () => publiser.mutate(blokk.id, { onSuccess: handleLukk });
  const typeLabel = labelForType(blokk.type);

  return (
    <Nav.Modal open onClose={handleLukk} aria-label="Bekreft publisering" width="small">
      <Nav.Modal.Header>
        <Nav.Heading size="small" level="1">
          Publisere {typeLabel}?
        </Nav.Heading>
      </Nav.Modal.Header>
      <Nav.Modal.Body>
        <Nav.BodyLong>
          <strong>«{blokk.tittel}</strong>» <br />
          <br />
          {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1) + "en"} blir tilgjengelig for saksbehandlere. Publiser
          først når innholdet er kvalitetssikret.
        </Nav.BodyLong>
        {publiser.error && (
          <Nav.Alert variant="error" size="small" style={{ marginTop: "0.75rem" }}>
            Kunne ikke publisere: {publiser.error.message}
          </Nav.Alert>
        )}
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Nav.Button variant="primary" onClick={handlePubliser} loading={publiser.isPending}>
          Publiser
        </Nav.Button>
        <Nav.Button variant="tertiary" onClick={handleLukk} disabled={publiser.isPending}>
          Avbryt
        </Nav.Button>
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
}

export default TekstblokkPubliserBekreftelse;
