import * as Nav from "../../../navFrontend";
import { usePubliserTekstblokk } from "../../../services/api/tekstblokker";
import { TekstblokkOversikt } from "../../../services/modules/tekstblokker";
import { labelForType } from "./labels";

interface Props {
  blokk: TekstblokkOversikt | null;
  onLukk: () => void;
}

function TekstblokkPubliserBekreftelse({ blokk, onLukk }: Props) {
  const publiser = usePubliserTekstblokk();

  if (!blokk) return null;

  const handlePubliser = () => publiser.mutate(blokk.id, { onSuccess: onLukk });

  return (
    <Nav.Modal open onClose={onLukk} aria-label="Bekreft publisering" width="small">
      <Nav.Modal.Header>
        <Nav.Heading size="small" level="1">
          Publisere {labelForType(blokk.type)}?
        </Nav.Heading>
      </Nav.Modal.Header>
      <Nav.Modal.Body>
        <Nav.BodyLong>
          <strong>{blokk.tittel}</strong> blir tilgjengelig for saksbehandlere i Send brev. Publiser først når innholdet
          er kvalitetssikret.
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
        <Nav.Button variant="tertiary" onClick={onLukk} disabled={publiser.isPending}>
          Avbryt
        </Nav.Button>
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
}

export default TekstblokkPubliserBekreftelse;
