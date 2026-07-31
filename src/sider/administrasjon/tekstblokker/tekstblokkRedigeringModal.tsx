import { useEffect, useMemo, useState } from "react";
import { ReadMore } from "@navikt/ds-react";

import * as Nav from "../../../navFrontend";
import HtmlEditor from "../../../felleskomponenter/htmlEditor/htmlEditor";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../../featuretoggle/toggleNavn";
import { isApiError } from "../../../services";
import { usePlaceholderKatalog } from "../../../services/api/placeholdere";
import { useOppdaterTekstblokk, useOpprettTekstblokk, useTekstblokk } from "../../../services/api/tekstblokker";
import {
  leggTilTag,
  TekstblokkRequest,
  TekstblokkStatus,
  TekstblokkType,
} from "../../../services/modules/tekstblokker";
import Kontekstavgrensning from "./kontekstavgrensning";
import { PlaceholderKatalogTabell, PlaceholderValgHjelpetekst } from "./placeholderKatalog";
import TagInput from "./tagInput";
import { labelForType } from "./labels";

// En 400 herfra er en verdi api-et ikke godtar (typisk en avgrensningskode), og den rå
// meldingen er teknisk. Andre feil viser vi som de er.
const feilmelding = (feil: Error | null): string | null => {
  if (!feil) return null;
  return isApiError(feil) && feil.status === 400
    ? "Ugyldig verdi i avgrensningen — last siden på nytt og prøv igjen"
    : feil.message;
};

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
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  // Boolean(): en toggle som ennå ikke er lastet er undefined, og ville truffet enabled-defaulten.
  const { data: katalog } = usePlaceholderKatalog(Boolean(dynamiskPlaceholderPaa));
  // Uten verdier her blir gyldige nøkler gule og ukjente røde – nettopp det admin trenger.
  const gyldigeNokler = useMemo(() => katalog?.map(({ nokkel }) => nokkel), [katalog]);

  const [tittel, setTittel] = useState("");
  const [innhold, setInnhold] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sakstyper, setSakstyper] = useState<string[]>([]);
  const [behandlingstemaer, setBehandlingstemaer] = useState<string[]>([]);
  // En tag som er skrevet, men ikke lagt til med Enter eller "Legg til"-knappen.
  const [tagUtkast, setTagUtkast] = useState("");

  useEffect(() => {
    if (eksisterende.data) {
      setTittel(eksisterende.data.tittel);
      setInnhold(eksisterende.data.innhold);
      setTags(eksisterende.data.tags);
      setSakstyper(eksisterende.data.sakstyper);
      setBehandlingstemaer(eksisterende.data.behandlingstemaer);
    }
  }, [eksisterende.data]);

  const lagrer = opprett.isPending || oppdater.isPending;
  const feil = feilmelding(opprett.error ?? oppdater.error);

  const kanLagre = tittel.trim().length > 0 && innhold.trim().length > 0 && !lagrer;

  // Redigering beholder statusen blokken har – publisering er en egen beslutning fra lista.
  const handleLagre = (status: TekstblokkStatus = eksisterende.data?.status ?? "PUBLISERT") => {
    if (!kanLagre) return;
    // Ta med en tag som står igjen i feltet, så den ikke går tapt fordi admin
    // glemte Enter eller "Legg til".
    const alleTags = leggTilTag(tags, tagUtkast);
    setTags(alleTags);
    setTagUtkast("");
    const request: TekstblokkRequest = {
      tittel: tittel.trim(),
      innhold,
      type,
      tags: alleTags,
      sakstyper,
      behandlingstemaer,
      status,
    };

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
        <Nav.Heading size="small" level="1">
          {overskrift}
        </Nav.Heading>
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

            <Kontekstavgrensning
              sakstyper={sakstyper}
              setSakstyper={setSakstyper}
              behandlingstemaer={behandlingstemaer}
              setBehandlingstemaer={setBehandlingstemaer}
            />

            <div className="tekstblokker__modal-editor">
              {/* Ingen innsetting av andre tekstblokker her – vi redigerer selve kilden. */}
              <HtmlEditor
                value={innhold}
                onChange={setInnhold}
                label="Innhold"
                visTekstblokkSoek={false}
                gyldigeNokler={gyldigeNokler}
              />
            </div>

            {dynamiskPlaceholderPaa && katalog && katalog.length > 0 && (
              <ReadMore header="Tilgjengelige placeholdere" size="small">
                <PlaceholderValgHjelpetekst />
                <PlaceholderKatalogTabell placeholdere={katalog} />
              </ReadMore>
            )}

            {feil && (
              <Nav.Alert variant="error" size="small">
                {feil}
              </Nav.Alert>
            )}
          </div>
        )}
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Nav.Button variant="primary" onClick={() => handleLagre()} disabled={!kanLagre} loading={lagrer}>
          {erRedigering ? "Lagre endringer" : "Opprett"}
        </Nav.Button>
        {!erRedigering && (
          <Nav.Button variant="secondary" onClick={() => handleLagre("UTKAST")} disabled={!kanLagre} loading={lagrer}>
            Lagre som utkast
          </Nav.Button>
        )}
        <Nav.Button variant="tertiary" onClick={onLukk} disabled={lagrer}>
          Avbryt
        </Nav.Button>
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
}

export default TekstblokkRedigeringModal;
