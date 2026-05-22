import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from "@navikt/aksel-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import * as Nav from "../../../navFrontend";

import {
  prefetchTekstblokkerIBatches,
  useFiltrerteTekstblokker,
  useTekstblokker,
} from "../../../services/api/tekstblokker";
import { TekstblokkOversikt, TekstblokkType } from "../../../services/modules/tekstblokker";
import TekstblokkRedigeringModal from "./tekstblokkRedigeringModal";
import TekstblokkSlettBekreftelse from "./tekstblokkSlettBekreftelse";
import TekstblokkerFilter from "./tekstblokkerFilter";
import TekstblokkerListe from "./tekstblokkerListe";
import { labelForType } from "./labels";

import "./tekstblokker.less";

type ModalTilstand = { type: "lukket" } | { type: "ny" } | { type: "rediger"; id: number };

function TekstblokkerSide() {
  const [type, setType] = useState<TekstblokkType>("TEKSTBLOKK");
  const [soek, setSoek] = useState("");
  const [valgteTags, setValgteTags] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalTilstand>({ type: "lukket" });
  const [slettBlokk, setSlettBlokk] = useState<TekstblokkOversikt | null>(null);
  const [utvidedeIder, setUtvidedeIder] = useState<Set<number>>(new Set());
  const [henterAlle, setHenterAlle] = useState(false);

  const queryClient = useQueryClient();
  const { data: blokker = [], isLoading, error } = useTekstblokker(type);

  const { tagAntall, synlige } = useFiltrerteTekstblokker(blokker, soek, valgteTags);
  const forslagTags = useMemo(() => tagAntall.map(([t]) => t), [tagAntall]);

  const alleErUtvidet = synlige.length > 0 && synlige.every((b) => utvidedeIder.has(b.id));

  const toggleAlle = async () => {
    if (henterAlle) return;
    if (alleErUtvidet) {
      setUtvidedeIder(new Set());
      return;
    }
    const ids = synlige.map((b) => b.id);
    setHenterAlle(true);
    try {
      await prefetchTekstblokkerIBatches(queryClient, ids);
      // Filter kan ha endret seg under prefetch – kun åpne IDs som fortsatt er synlige.
      setUtvidedeIder((prev) => {
        const fortsatt = new Set(prev);
        const synligeIder = new Set(synlige.map((b) => b.id));
        ids.forEach((id) => {
          if (synligeIder.has(id)) fortsatt.add(id);
        });
        return fortsatt;
      });
    } finally {
      setHenterAlle(false);
    }
  };

  const toggleRad = (id: number) => {
    setUtvidedeIder((prev) => {
      const ny = new Set(prev);
      if (ny.has(id)) ny.delete(id);
      else ny.add(id);
      return ny;
    });
  };

  const byttType = (nyType: TekstblokkType) => {
    setType(nyType);
    setValgteTags([]);
    setUtvidedeIder(new Set());
  };

  return (
    <div className="tekstblokker">
      <div className="tekstblokker__header">
        <Nav.Heading size="large" level="1">
          Tekstblokker og brevmaler
        </Nav.Heading>
        <Nav.Button variant="primary" icon={<PlusIcon aria-hidden />} onClick={() => setModal({ type: "ny" })}>
          Ny {labelForType(type)}
        </Nav.Button>
      </div>

      <TekstblokkerFilter
        type={type}
        setType={byttType}
        soek={soek}
        setSoek={setSoek}
        valgteTags={valgteTags}
        setValgteTags={setValgteTags}
        tilgjengeligeTags={tagAntall}
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
            loading={henterAlle}
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
          onToggleUtvidet={toggleRad}
          onRediger={(id) => setModal({ type: "rediger", id })}
          onSlett={setSlettBlokk}
        />
      )}

      <TekstblokkRedigeringModal
        aapen={modal.type !== "lukket"}
        redigerId={modal.type === "rediger" ? modal.id : null}
        type={type}
        forslagTags={forslagTags}
        onLukk={() => setModal({ type: "lukket" })}
      />

      <TekstblokkSlettBekreftelse blokk={slettBlokk} onLukk={() => setSlettBlokk(null)} />
    </div>
  );
}

export default TekstblokkerSide;
