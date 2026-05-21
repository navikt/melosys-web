import { PlusIcon } from "@navikt/aksel-icons";
import { useMemo, useState } from "react";

import * as Nav from "../../../navFrontend";

import { useTekstblokker } from "../../../services/api/tekstblokker";
import { TekstblokkOversikt, TekstblokkType } from "../../../services/modules/tekstblokker";
import TekstblokkRedigeringModal from "./tekstblokkRedigeringModal";
import TekstblokkSlettBekreftelse from "./tekstblokkSlettBekreftelse";
import TekstblokkerFilter from "./tekstblokkerFilter";
import TekstblokkerListe from "./tekstblokkerListe";
import { labelForType } from "./labels";
import { matcherSoek, tellTags } from "./tekstblokkerUtils";

import "./tekstblokker.less";

type ModalTilstand = { type: "lukket" } | { type: "ny" } | { type: "rediger"; id: number };

function TekstblokkerSide() {
  const [type, setType] = useState<TekstblokkType>("TEKSTBLOKK");
  const [soek, setSoek] = useState("");
  const [valgteTags, setValgteTags] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalTilstand>({ type: "lukket" });
  const [slettBlokk, setSlettBlokk] = useState<TekstblokkOversikt | null>(null);

  const { data: blokker = [], isLoading, error } = useTekstblokker(type);

  const etterSoek = useMemo(() => blokker.filter((b) => matcherSoek(b, soek)), [blokker, soek]);
  const tagAntall = useMemo(() => tellTags(etterSoek), [etterSoek]);
  const synlige = useMemo(
    () => (valgteTags.length === 0 ? etterSoek : etterSoek.filter((b) => valgteTags.some((t) => b.tags.includes(t)))),
    [etterSoek, valgteTags],
  );
  const forslagTags = useMemo(() => tagAntall.map(([t]) => t), [tagAntall]);

  const byttType = (nyType: TekstblokkType) => {
    setType(nyType);
    setValgteTags([]);
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

      {!isLoading && !error && (
        <TekstblokkerListe
          blokker={synlige}
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
