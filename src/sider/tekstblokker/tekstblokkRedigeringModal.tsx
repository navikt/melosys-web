import { useEffect, useMemo, useRef, useState } from "react";
import { ReadMore } from "@navikt/ds-react";

import * as Nav from "../../navFrontend";
import HtmlEditor from "../../felleskomponenter/htmlEditor/htmlEditor";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../featuretoggle/toggleNavn";
import { isApiError } from "../../services";
import { useBetingelseKatalog, usePlaceholderKatalog } from "../../services/api/placeholdere";
import { useOppdaterTekstblokk, useOpprettTekstblokk, useTekstblokk } from "../../services/api/tekstblokker";
import { finnSakstypeKonflikter } from "../../services/modules/placeholdere";
import { leggTilTag, TekstblokkRequest, TekstblokkStatus, TekstblokkType } from "../../services/modules/tekstblokker";
import Kontekstavgrensning, { termForSakstype } from "./kontekstavgrensning";
import { PlaceholderKatalogTabell, PlaceholderValgHjelpetekst } from "./placeholderKatalog";
import TagInput from "./tagInput";
import { labelForType } from "./labels";

// Api-ets egen forklaring vises til admin.
const feilmelding = (feil: Error | null): string | null => {
  if (!feil) return null;
  if (!isApiError(feil)) return feil.message;
  // ApiError.message er statusteksten («Bad Request»); forklaringen ligger i responsbodyen.
  return feil.body?.message ?? feil.message;
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
  const { data: betingelseKatalog } = useBetingelseKatalog(Boolean(dynamiskPlaceholderPaa));
  // Uten verdier her blir gyldige nøkler gule og ukjente røde – nettopp det admin trenger.
  const gyldigeNokler = useMemo(() => katalog?.map(({ nokkel }) => nokkel), [katalog]);
  const gyldigeBetingelsesNokler = useMemo(() => betingelseKatalog?.map(({ nokkel }) => nokkel), [betingelseKatalog]);

  const [tittel, setTittel] = useState("");
  const [innhold, setInnhold] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sakstyper, setSakstyper] = useState<string[]>([]);
  const [sakstemaer, setSakstemaer] = useState<string[]>([]);
  const [behandlingstemaer, setBehandlingstemaer] = useState<string[]>([]);
  // En tag som er skrevet, men ikke lagt til med Enter eller "Legg til"-knappen.
  const [tagUtkast, setTagUtkast] = useState("");
  const [avgrensningApen, setAvgrensningApen] = useState(false);

  // Skjemaet fylles én gang per åpnet blokk: en bakgrunns-refetch gir et nytt data-objekt, og
  // uten dette ville den nullstilt det admin holder på å skrive.
  const initiertId = useRef<number | null>(null);
  useEffect(() => {
    initiertId.current = null;
  }, [redigerId]);

  useEffect(() => {
    if (eksisterende.data && initiertId.current !== eksisterende.data.id) {
      initiertId.current = eksisterende.data.id;
      setTittel(eksisterende.data.tittel);
      setInnhold(eksisterende.data.innhold);
      setTags(eksisterende.data.tags);
      setSakstyper(eksisterende.data.sakstyper);
      setSakstemaer(eksisterende.data.sakstemaer);
      setBehandlingstemaer(eksisterende.data.behandlingstemaer);
      // En lagret avgrensning må være synlig med en gang, ellers ser blokken ut til å gjelde alle.
      if (
        eksisterende.data.sakstyper.length > 0 ||
        eksisterende.data.sakstemaer.length > 0 ||
        eksisterende.data.behandlingstemaer.length > 0
      )
        setAvgrensningApen(true);
    }
  }, [eksisterende.data]);

  const konflikter = useMemo(
    () => (dynamiskPlaceholderPaa ? finnSakstypeKonflikter(innhold, sakstyper, katalog, betingelseKatalog) : []),
    [dynamiskPlaceholderPaa, innhold, sakstyper, katalog, betingelseKatalog],
  );

  const lagrer = opprett.isPending || oppdater.isPending;
  const feil = feilmelding(opprett.error ?? oppdater.error);

  const kanLagre = tittel.trim().length > 0 && innhold.trim().length > 0 && !lagrer;

  // Typet parameter: utypet ville en onClick={handleLagre} sendt MouseEvent som status.
  const handleLagre = (status: TekstblokkStatus = "PUBLISERT") => {
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
      sakstemaer,
      behandlingstemaer,
    };

    if (redigerId !== null) {
      // PUT er ingen statusbeslutning: feltet utelates, og api-et lar statusen stå som den er.
      oppdater.mutate({ id: redigerId, body: request }, { onSuccess: onLukk });
    } else {
      opprett.mutate({ ...request, status }, { onSuccess: onLukk });
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

            <ReadMore
              header="Avgrens til sakstype/sakstema/behandlingstema"
              size="small"
              open={avgrensningApen}
              onClick={() => setAvgrensningApen(!avgrensningApen)}
            >
              {/* Monteres foerst naar utvidelsen aapnes: ReadMore rendrer alltid children,
                  bare skjult. Uten dette ville kombinasjonstreet hentes ved hver
                  modalaapning, og et varsel om at det feilet ligge usynlig i det
                  sammenslaatte omraadet. */}
              {avgrensningApen && (
                <Kontekstavgrensning
                  sakstyper={sakstyper}
                  setSakstyper={setSakstyper}
                  sakstemaer={sakstemaer}
                  setSakstemaer={setSakstemaer}
                  behandlingstemaer={behandlingstemaer}
                  setBehandlingstemaer={setBehandlingstemaer}
                />
              )}
            </ReadMore>

            <div className="tekstblokker__modal-editor">
              {/* Ingen innsetting av andre tekstblokker her – vi redigerer selve kilden. */}
              <HtmlEditor
                value={innhold}
                onChange={setInnhold}
                label="Innhold"
                visTekstblokkSoek={false}
                gyldigeNokler={gyldigeNokler}
                gyldigeBetingelsesNokler={gyldigeBetingelsesNokler}
              />
            </div>

            {/* Ikke-blokkerende: avgrensningen kan være riktig selv om placeholderen mangler
                for én sakstype – da må admin vurdere teksten. */}
            {konflikter.length > 0 && (
              <Nav.Alert variant="warning" size="small">
                <Nav.BodyShort size="small">Noen felter dekker ikke alle sakstypene blokken gjelder:</Nav.BodyShort>
                <Nav.List>
                  {konflikter.map(({ nokkel, visningsnavn, sakstyper: udekkede, stottedeSakstyper }) => (
                    <Nav.List.Item key={nokkel}>
                      {/* Fet: feltnavnet skal kunne skilles fra resten av setningen på et blikk. */}
                      <strong>{visningsnavn}</strong>
                      {udekkede.length > 0
                        ? ` støtter ikke: ${udekkede.map(termForSakstype).join(", ")}`
                        : ` støttes bare for: ${stottedeSakstyper
                            .map(termForSakstype)
                            .join(", ")} — blokken gjelder alle sakstyper`}
                    </Nav.List.Item>
                  ))}
                </Nav.List>
              </Nav.Alert>
            )}

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
