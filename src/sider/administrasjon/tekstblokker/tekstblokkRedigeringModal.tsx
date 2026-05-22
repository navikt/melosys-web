import { BodyShort } from "@navikt/ds-react";
import { useEffect, useState } from "react";

import * as Nav from "../../../navFrontend";
import HtmlEditor from "../../../felleskomponenter/htmlEditor/htmlEditor";
import { useOppdaterTekstblokk, useOpprettTekstblokk, useTekstblokk } from "../../../services/api/tekstblokker";
import { TekstblokkRequest, TekstblokkType } from "../../../services/modules/tekstblokker";
import TagInput from "./tagInput";
import { labelForType } from "./labels";

interface Props {
  aapen: boolean;
  redigerId: number | null;
  type: TekstblokkType;
  forslagTags: string[];
  onLukk: () => void;
}

function TekstblokkRedigeringModal({ aapen, redigerId, type, forslagTags, onLukk }: Props) {
  const erRedigering = redigerId !== null;
  const eksisterende = useTekstblokk(aapen ? redigerId : null);
  const opprett = useOpprettTekstblokk();
  const oppdater = useOppdaterTekstblokk();

  const [tittel, setTittel] = useState("");
  const [innhold, setInnhold] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Modalen remountes med ny key per redigerId/ny, så useEffect kjører bare når data lastes.
  useEffect(() => {
    if (eksisterende.data) {
      setTittel(eksisterende.data.tittel);
      setInnhold(eksisterende.data.innhold);
      setTags(eksisterende.data.tags);
    }
  }, [eksisterende.data]);

  const lagrer = opprett.isPending || oppdater.isPending;
  const feil = opprett.error?.message ?? oppdater.error?.message ?? null;

  const kanLagre = tittel.trim().length > 0 && innhold.trim().length > 0 && !lagrer;

  const handleLagre = () => {
    if (!kanLagre) return;
    const request: TekstblokkRequest = { tittel: tittel.trim(), innhold, type, tags };

    if (redigerId !== null) {
      oppdater.mutate({ id: redigerId, body: request }, { onSuccess: onLukk });
    } else {
      opprett.mutate(request, { onSuccess: onLukk });
    }
  };

  const overskrift = `${erRedigering ? "Rediger" : "Ny"} ${labelForType(type)}`;

  return (
    <Nav.Modal open={aapen} onClose={onLukk} aria-label={overskrift} width="medium">
      <Nav.Modal.Header>
        <BodyShort weight="semibold" size="medium">
          {overskrift}
        </BodyShort>
      </Nav.Modal.Header>
      <Nav.Modal.Body>
        {erRedigering && eksisterende.isLoading ? (
          <div className="tekstblokker__modal-laster">
            <Nav.Loader />
          </div>
        ) : (
          <div className="tekstblokker__modal-skjema">
            <Nav.TextField
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
              <Nav.Alert variant="error" size="small">
                {feil}
              </Nav.Alert>
            )}
          </div>
        )}
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Nav.Button variant="primary" onClick={handleLagre} disabled={!kanLagre} loading={lagrer}>
          {erRedigering ? "Lagre endringer" : "Opprett"}
        </Nav.Button>
        <Nav.Button variant="tertiary" onClick={onLukk} disabled={lagrer}>
          Avbryt
        </Nav.Button>
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
}

export default TekstblokkRedigeringModal;
