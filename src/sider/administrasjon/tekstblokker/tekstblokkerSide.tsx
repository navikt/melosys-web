import { Alert, Button, Heading, Loader } from "@navikt/ds-react";
import { PlusIcon } from "@navikt/aksel-icons";
import { useMemo, useState } from "react";

import { useTekstblokker } from "../../../services/api/tekstblokker";
import { TekstblokkOversikt, TekstblokkType } from "../../../services/modules/tekstblokker";
import TekstblokkRedigeringModal from "./tekstblokkRedigeringModal";
import TekstblokkSlettBekreftelse from "./tekstblokkSlettBekreftelse";
import TekstblokkerFilter from "./tekstblokkerFilter";
import TekstblokkerListe from "./tekstblokkerListe";
import { filtrer, tellTags } from "./tekstblokkerUtils";

import "./tekstblokker.less";

function TekstblokkerSide() {
  const [type, setType] = useState<TekstblokkType>("TEKSTBLOKK");
  const [soek, setSoek] = useState("");
  const [valgteTags, setValgteTags] = useState<string[]>([]);
  const [redigerId, setRedigerId] = useState<number | null>(null);
  const [redigerAapen, setRedigerAapen] = useState(false);
  const [slettBlokk, setSlettBlokk] = useState<TekstblokkOversikt | null>(null);

  const { data: blokker = [], isLoading, error } = useTekstblokker(type);

  const tagAntall = useMemo(() => tellTags(filtrerBareSoek(blokker, soek)), [blokker, soek]);
  const synlige = useMemo(() => filtrer(blokker, soek, valgteTags), [blokker, soek, valgteTags]);
  const forslagTags = useMemo(() => tagAntall.map(([t]) => t), [tagAntall]);

  const aapneNy = () => {
    setRedigerId(null);
    setRedigerAapen(true);
  };

  const aapneRediger = (id: number) => {
    setRedigerId(id);
    setRedigerAapen(true);
  };

  const byttType = (nyType: TekstblokkType) => {
    setType(nyType);
    setValgteTags([]);
  };

  return (
    <div className="tekstblokker">
      <div className="tekstblokker__header">
        <Heading size="large" level="1">
          Tekstblokker og brevmaler
        </Heading>
        <Button variant="primary" icon={<PlusIcon aria-hidden />} onClick={aapneNy}>
          Ny {type === "BREVMAL" ? "brevmal" : "tekstblokk"}
        </Button>
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
          <Loader size="large" />
        </div>
      )}

      {error && <Alert variant="error">Kunne ikke hente tekstblokker: {error.message}</Alert>}

      {!isLoading && !error && <TekstblokkerListe blokker={synlige} onRediger={aapneRediger} onSlett={setSlettBlokk} />}

      <TekstblokkRedigeringModal
        aapen={redigerAapen}
        redigerId={redigerId}
        type={type}
        forslagTags={forslagTags}
        onLukk={() => setRedigerAapen(false)}
        onLagret={() => undefined}
      />

      <TekstblokkSlettBekreftelse blokk={slettBlokk} onLukk={() => setSlettBlokk(null)} onSlettet={() => undefined} />
    </div>
  );
}

const filtrerBareSoek = (blokker: TekstblokkOversikt[], soek: string): TekstblokkOversikt[] => {
  if (!soek) return blokker;
  const norm = soek.toLowerCase().trim();
  return blokker.filter((b) => b.tittel.toLowerCase().includes(norm) || b.tags.some((t) => t.includes(norm)));
};

export default TekstblokkerSide;
