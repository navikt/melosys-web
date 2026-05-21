import { Alert, BodyLong, BodyShort, Button, Modal } from "@navikt/ds-react";

import { useSlettTekstblokk } from "../../../services/api/tekstblokker";
import { TekstblokkOversikt } from "../../../services/modules/tekstblokker";

interface Props {
  blokk: TekstblokkOversikt | null;
  onLukk: () => void;
  onSlettet: () => void;
}

function TekstblokkSlettBekreftelse({ blokk, onLukk, onSlettet }: Props) {
  const slett = useSlettTekstblokk();

  if (!blokk) return null;

  const handleSlett = () => {
    slett.mutate(blokk.id, {
      onSuccess: () => {
        onSlettet();
        onLukk();
      },
    });
  };

  return (
    <Modal open onClose={onLukk} aria-label="Bekreft sletting" width="small">
      <Modal.Header>
        <BodyShort weight="semibold" size="medium">
          Slette tekstblokken?
        </BodyShort>
      </Modal.Header>
      <Modal.Body>
        <BodyLong>
          Du er i ferd med å slette <strong>{blokk.tittel}</strong>. Dette kan ikke angres, og blokken vil ikke lenger
          være tilgjengelig i Send brev.
        </BodyLong>
        {slett.error && (
          <Alert variant="error" size="small" style={{ marginTop: "0.75rem" }}>
            Kunne ikke slette: {slett.error.message}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleSlett} loading={slett.isPending}>
          Slett
        </Button>
        <Button variant="tertiary" onClick={onLukk} disabled={slett.isPending}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TekstblokkSlettBekreftelse;
