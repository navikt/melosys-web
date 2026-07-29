import { BodyShort } from "@navikt/ds-react";
import { useEffect, useState } from "react";

import * as Nav from "../../../navFrontend";
import HtmlEditor from "../../../felleskomponenter/htmlEditor/htmlEditor";
import { useOppdaterTekstblokk, useOpprettTekstblokk, useTekstblokk } from "../../../services/api/tekstblokker";
import { leggTilTag, TekstblokkRequest, TekstblokkType } from "../../../services/modules/tekstblokker";
import TagInput from "./tagInput";
import { labelForType } from "./labels";

interface Props {
  redigerId: number | null;
  type: TekstblokkType;
  forslagTags: string[];
  onLukk: () => void;
}

function TekstblokkRedigeringModal({ redigerId, type, forslagTags, onLukk }: Props) {
  const erRedigering = redigerId !== null;
  const eksisterende = useTekstblokk(redigerId);
  const opprett = useOpprettTekstblokk();
  const oppdater = useOppdaterTekstblokk();

  const [tittel, setTittel] = useState("");
  const [innhold, setInnhold] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  // En tag som er skrevet, men ikke lagt til med Enter eller "Legg til"-knappen.
  const [tagUtkast, setTagUtkast] = useState("");

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
    // Ta med en tag som står igjen i feltet, så den ikke går tapt fordi admin
    // glemte Enter eller "Legg til".
    const alleTags = leggTilTag(tags, tagUtkast);
    setTags(alleTags);
    setTagUtkast("");
    const request: TekstblokkRequest = { tittel: tittel.trim(), innhold, type, tags: alleTags };

    if (redigerId !== null) {
      oppdater.mutate({ id: redigerId, body: request }, { onSuccess: onLukk });
    } else {
      opprett.mutate(request, { onSuccess: onLukk });
    }
  };

  const overskrift = `${erRedigering ? "Rediger" : "Ny"} ${labelForType(type)}`;

  return (
    <Nav.Modal open onClose={onLukk} aria-label={overskrift} width="medium">
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

            <TagInput
              verdier={tags}
              setVerdier={setTags}
              forslag={forslagTags}
              utkast={tagUtkast}
              setUtkast={setTagUtkast}
            />

            <div className="tekstblokker__modal-editor">
              {/* Ingen innsetting av andre tekstblokker her – vi redigerer selve kilden. */}
              <HtmlEditor value={innhold} onChange={setInnhold} label="Innhold" visTekstblokkSoek={false} />
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
