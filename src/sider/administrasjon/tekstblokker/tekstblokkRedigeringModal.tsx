import { Alert, BodyShort, Button, Loader, Modal, TextField } from "@navikt/ds-react";
import { useEffect, useState } from "react";

import HtmlEditor from "../../../felleskomponenter/htmlEditor/htmlEditor";
import { useOppdaterTekstblokk, useOpprettTekstblokk, useTekstblokk } from "../../../services/api/tekstblokker";
import { TekstblokkRequest, TekstblokkType } from "../../../services/modules/tekstblokker";
import TagInput from "./tagInput";

interface Props {
  aapen: boolean;
  redigerId: number | null;
  type: TekstblokkType;
  forslagTags: string[];
  onLukk: () => void;
  onLagret: () => void;
}

function TekstblokkRedigeringModal({ aapen, redigerId, type, forslagTags, onLukk, onLagret }: Props) {
  const erRedigering = redigerId !== null;
  const eksisterende = useTekstblokk(aapen ? redigerId : null);
  const opprett = useOpprettTekstblokk();
  const oppdater = useOppdaterTekstblokk();

  const [tittel, setTittel] = useState("");
  const [innhold, setInnhold] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!aapen) return;
    if (erRedigering && eksisterende.data) {
      setTittel(eksisterende.data.tittel);
      setInnhold(eksisterende.data.innhold);
      setTags(eksisterende.data.tags);
    } else if (!erRedigering) {
      setTittel("");
      setInnhold("");
      setTags([]);
    }
  }, [aapen, erRedigering, eksisterende.data]);

  const lagrer = opprett.isPending || oppdater.isPending;
  const feil = opprett.error?.message ?? oppdater.error?.message ?? null;

  const kanLagre = tittel.trim().length > 0 && innhold.trim().length > 0 && !lagrer;

  const handleLagre = () => {
    if (!kanLagre) return;
    const request: TekstblokkRequest = {
      tittel: tittel.trim(),
      innhold,
      type,
      tags,
    };

    const onSuccess = () => {
      onLagret();
      onLukk();
    };

    if (erRedigering && redigerId !== null) {
      oppdater.mutate({ id: redigerId, body: request }, { onSuccess });
    } else {
      opprett.mutate(request, { onSuccess });
    }
  };

  const overskrift = erRedigering
    ? `Rediger ${type === "BREVMAL" ? "brevmal" : "tekstblokk"}`
    : `Ny ${type === "BREVMAL" ? "brevmal" : "tekstblokk"}`;

  return (
    <Modal open={aapen} onClose={onLukk} aria-label={overskrift} width="medium">
      <Modal.Header>
        <BodyShort weight="semibold" size="medium">
          {overskrift}
        </BodyShort>
      </Modal.Header>
      <Modal.Body>
        {erRedigering && eksisterende.isLoading ? (
          <div className="tekstblokker__modal-laster">
            <Loader />
          </div>
        ) : (
          <div className="tekstblokker__modal-skjema">
            <TextField
              label="Tittel"
              size="small"
              value={tittel}
              onChange={(e) => setTittel(e.target.value)}
              maxLength={200}
            />

            <TagInput verdier={tags} setVerdier={setTags} forslag={forslagTags} />

            <div className="tekstblokker__modal-editor">
              <HtmlEditor value={innhold} onChange={setInnhold} label="Innhold" />
            </div>

            {feil && (
              <Alert variant="error" size="small">
                {feil}
              </Alert>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleLagre} disabled={!kanLagre} loading={lagrer}>
          {erRedigering ? "Lagre endringer" : "Opprett"}
        </Button>
        <Button variant="tertiary" onClick={onLukk} disabled={lagrer}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TekstblokkRedigeringModal;
