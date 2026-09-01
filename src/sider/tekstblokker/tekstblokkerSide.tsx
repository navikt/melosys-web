import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from "@navikt/aksel-icons";
import { useMemo, useState } from "react";

import * as Nav from "../../navFrontend";

import { useFiltrerteTekstblokker, useTekstblokker } from "../../services/api/tekstblokker";
import { Statusfilter, tellTags, TekstblokkOversikt, TekstblokkType } from "../../services/modules/tekstblokker";
import TekstblokkPubliserBekreftelse from "./tekstblokkPubliserBekreftelse";
import TekstblokkRedigeringModal from "./tekstblokkRedigeringModal";
import TekstblokkSlettBekreftelse from "./tekstblokkSlettBekreftelse";
import TekstblokkerFilter from "./tekstblokkerFilter";
import TekstblokkerListe from "./tekstblokkerListe";
import PlaceholderKatalog from "./placeholderKatalog";
import { labelForType } from "./labels";

import "./tekstblokker.less";

type ModalTilstand = { type: "lukket" } | { type: "ny" } | { type: "rediger"; id: number };

interface Props {
  // Admin får redigering; lesevisningen på /brevbibliotek deler alt annet, men er
  // skrivebeskyttet og ser bare publiserte blokker.
  kanRedigere?: boolean;
}

function TekstblokkerSide({ kanRedigere = true }: Props) {
  const [type, setType] = useState<TekstblokkType>("TEKSTBLOKK");
  const [soek, setSoek] = useState("");
  const [valgteTags, setValgteTags] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalTilstand>({ type: "lukket" });
  const [statusfilter, setStatusfilter] = useState<Statusfilter>("ALLE");
  const [slettBlokk, setSlettBlokk] = useState<TekstblokkOversikt | null>(null);
  const [publiserBlokk, setPubliserBlokk] = useState<TekstblokkOversikt | null>(null);
  const [utvidedeIder, setUtvidedeIder] = useState<Set<number>>(new Set());
  // Historikken vises i den utvidede raden, så valget hører sammen med utvidedeIder: lukkes
  // raden, faller historikkvalget bort og neste åpning viser forhåndsvisningen.
  const [historikkId, setHistorikkId] = useState<number | null>(null);

  // Admin ber eksplisitt om utkast – api-et leverer dem kun hit, aldri til Send brev-søket
  // eller lesevisningen.
  const { data: blokker = [], isLoading, error } = useTekstblokker(type, true, kanRedigere);

  // Tags er ett felles vokabular på tvers av tekstblokker og brevmaler, så forslagene i
  // modalen tar med begge typer. Hentes først når modalen åpnes.
  const motsattType: TekstblokkType = type === "TEKSTBLOKK" ? "BREVMAL" : "TEKSTBLOKK";
  const { data: blokkerAvMotsattType = [] } = useTekstblokker(motsattType, modal.type !== "lukket", true);

  // Admin staar ikke i en sak, saa ingen kontekst avgrenser lista. Uten redigeringstilgang
  // er kun publiserte blokker hentet, og statusvalget er da ikke brukerens å ta.
  const { tagAntall, synlige } = useFiltrerteTekstblokker(
    blokker,
    soek,
    valgteTags,
    {},
    kanRedigere ? statusfilter : "PUBLISERT",
  );
  // Ikke tagAntall: det telles over blokkene som matcher søket, og hører hjemme i
  // filteret over lista – ikke i forslagene.
  const forslagTags = useMemo(
    () => tellTags([...blokker, ...blokkerAvMotsattType]).map(([t]) => t),
    [blokker, blokkerAvMotsattType],
  );

  const alleErUtvidet = synlige.length > 0 && synlige.every((b) => utvidedeIder.has(b.id));

  const toggleAlle = () => {
    setUtvidedeIder(alleErUtvidet ? new Set() : new Set(synlige.map((b) => b.id)));
    if (alleErUtvidet) setHistorikkId(null);
  };

  const toggleRad = (id: number) => {
    setUtvidedeIder((prev) => {
      const ny = new Set(prev);
      if (ny.has(id)) ny.delete(id);
      else ny.add(id);
      return ny;
    });
    if (utvidedeIder.has(id) && historikkId === id) setHistorikkId(null);
  };

  // Historikken vises kun i en åpen rad, så knappen åpner raden om den er lukket.
  const toggleHistorikk = (id: number) => {
    setHistorikkId(historikkId === id ? null : id);
    setUtvidedeIder((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  const byttType = (nyType: TekstblokkType) => {
    setType(nyType);
    setValgteTags([]);
    setUtvidedeIder(new Set());
    setHistorikkId(null);
  };

  return (
    <div className="tekstblokker">
      <div className="tekstblokker__header">
        <Nav.Heading size="large" level="1">
          Brev- og tekstbibliotek
        </Nav.Heading>
        {kanRedigere && (
          <Nav.Button variant="primary" icon={<PlusIcon aria-hidden />} onClick={() => setModal({ type: "ny" })}>
            Ny {labelForType(type)}
          </Nav.Button>
        )}
      </div>

      {kanRedigere && <PlaceholderKatalog />}

      <TekstblokkerFilter
        type={type}
        setType={byttType}
        soek={soek}
        setSoek={setSoek}
        valgteTags={valgteTags}
        setValgteTags={setValgteTags}
        tilgjengeligeTags={tagAntall}
        visStatusfilter={kanRedigere}
        statusfilter={statusfilter}
        setStatusfilter={setStatusfilter}
      />

      {isLoading && (
        <div className="tekstblokker__laster">
          <Nav.Loader size="large" />
        </div>
      )}

      {error && <Nav.Alert variant="error">Kunne ikke hente tekstblokker: {error.message}</Nav.Alert>}

      {!isLoading && !error && synlige.length > 0 && (
        <div className="tekstblokker__tabell-verktoy">
          <Nav.Button
            size="small"
            variant="tertiary"
            onClick={toggleAlle}
            icon={alleErUtvidet ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
          >
            {alleErUtvidet ? "Skjul alle" : "Vis innhold for alle"}
          </Nav.Button>
        </div>
      )}

      {!isLoading && !error && (
        <TekstblokkerListe
          blokker={synlige}
          utvidedeIder={utvidedeIder}
          historikkId={historikkId}
          onToggleUtvidet={toggleRad}
          kanRedigere={kanRedigere}
          onToggleHistorikk={toggleHistorikk}
          onRediger={(id) => setModal({ type: "rediger", id })}
          onSlett={setSlettBlokk}
          onPubliser={setPubliserBlokk}
        />
      )}

      {kanRedigere && (
        <>
          {modal.type !== "lukket" && (
            <TekstblokkRedigeringModal
              redigerId={modal.type === "rediger" ? modal.id : null}
              type={type}
              forslagTags={forslagTags}
              onLukk={() => setModal({ type: "lukket" })}
            />
          )}

          <TekstblokkSlettBekreftelse blokk={slettBlokk} onLukk={() => setSlettBlokk(null)} />

          <TekstblokkPubliserBekreftelse blokk={publiserBlokk} onLukk={() => setPubliserBlokk(null)} />
        </>
      )}
    </div>
  );
}

export default TekstblokkerSide;
