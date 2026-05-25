import { BodyShort } from "@navikt/ds-react";

import * as Nav from "../../../navFrontend";
import { useSlettTekstblokk } from "../../../services/api/tekstblokker";
import { TekstblokkOversikt } from "../../../services/modules/tekstblokker";
import { labelForType } from "./labels";

interface Props {
  blokk: TekstblokkOversikt | null;
  onLukk: () => void;
}

function TekstblokkSlettBekreftelse({ blokk, onLukk }: Props) {
  const slett = useSlettTekstblokk();

  if (!blokk) return null;

  const handleSlett = () => slett.mutate(blokk.id, { onSuccess: onLukk });

  return (
    <Nav.Modal open onClose={onLukk} aria-label="Bekreft sletting" width="small">
      <Nav.Modal.Header>
        <BodyShort weight="semibold" size="medium">
          Slette {labelForType(blokk.type)}?
        </BodyShort>
      </Nav.Modal.Header>
      <Nav.Modal.Body>
        <Nav.BodyLong>
          Du er i ferd med å slette <strong>{blokk.tittel}</strong>. Dette kan ikke angres, og blokken vil ikke lenger
          være tilgjengelig i Send brev.
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
