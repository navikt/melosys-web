import { BodyShort, Chips, Popover, Search, Tabs } from "@navikt/ds-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import * as Nav from "../../navFrontend";
import * as Tekstblokker from "../../services/modules/tekstblokker";
import {
  prefetchTekstblokkerIBatches,
  tekstblokkerKeys,
  useFiltrerteTekstblokker,
  useTekstblokker,
} from "../../services/api/tekstblokker";
import { TekstblokkOversikt, TekstblokkType, toggleITegnliste } from "../../services/modules/tekstblokker";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../featuretoggle/toggleNavn";
import TekstblokkForhandsvisning from "./tekstblokkForhandsvisning";
import "./tekstblokkSoek.less";

interface Props {
  onVelg: (html: string) => void;
  disabled?: boolean;
}

const MAKS_SYNLIG = 8;

function TekstblokkSoek({ onVelg, disabled }: Props) {
  const togglePaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  if (!togglePaa) return null;
  return <TekstblokkSoekIntern onVelg={onVelg} disabled={disabled} />;
}

function TekstblokkSoekIntern({ onVelg, disabled }: Props) {
  const ankerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [aapen, setAapen] = useState(false);
  const [aktivType, setAktivType] = useState<TekstblokkType>("TEKSTBLOKK");
  const [soek, setSoek] = useState("");
  const [valgteTags, setValgteTags] = useState<string[]>([]);

  const { data: blokker = [], isLoading } = useTekstblokker(aktivType, aapen);

  const { tagAntall, synlige: filtrerte } = useFiltrerteTekstblokker(blokker, soek, valgteTags);

  const synlige = filtrerte.slice(0, MAKS_SYNLIG);
  const skjult = Math.max(0, filtrerte.length - synlige.length);

  const synligeIdsKey = synlige.map((b) => b.id).join(",");
  useEffect(() => {
    if (!aapen || synlige.length === 0) return;
    void prefetchTekstblokkerIBatches(
      queryClient,
      synlige.map((b) => b.id),
    );
  }, [aapen, synligeIdsKey, queryClient]);

  const lukk = () => {
    setAapen(false);
    setSoek("");
    setValgteTags([]);
  };

  const byttType = (verdi: string) => {
    setAktivType(verdi as TekstblokkType);
    setValgteTags([]);
  };

  return (
    <>
      <div className="tekstblokkSoek__verktoylinje" ref={ankerRef}>
        <Nav.Button
          variant="tertiary"
          size="small"
          onClick={() => (aapen ? lukk() : setAapen(true))}
          disabled={disabled}
          type="button"
        >
          Sett inn tekstblokk
        </Nav.Button>
      </div>
      <Popover
        open={aapen}
        onClose={lukk}
        anchorEl={ankerRef.current}
        placement="top-end"
        arrow={false}
        className="tekstblokkSoek__popover"
      >
        <Popover.Content className="tekstblokkSoek__innhold">
          <Tabs value={aktivType} onChange={byttType} size="small">
            <Tabs.List>
              <Tabs.Tab value="TEKSTBLOKK" label="Tekstblokker" />
              <Tabs.Tab value="BREVMAL" label="Brevmaler" />
            </Tabs.List>
          </Tabs>

          <Search
            label="Søk"
            hideLabel
            size="small"
            placeholder="Søk på tittel eller tag…"
            value={soek}
            onChange={setSoek}
            variant="simple"
            autoFocus
          />

          {tagAntall.length > 0 && (
            <div className="tekstblokkSoek__tags">
              <Chips size="small">
                {tagAntall.map(([tag, antall]) => (
                  <Chips.Toggle
                    key={tag}
                    selected={valgteTags.includes(tag)}
                    onClick={() => setValgteTags(toggleITegnliste(valgteTags, tag))}
                  >
                    {`${tag} (${antall})`}
                  </Chips.Toggle>
                ))}
                {valgteTags.length > 0 && (
                  <Chips.Removable variant="neutral" onClick={() => setValgteTags([])}>
                    Nullstill
                  </Chips.Removable>
                )}
              </Chips>
            </div>
          )}

          <div className="tekstblokkSoek__liste">
            {isLoading && (
              <div className="tekstblokkSoek__laster">
                <Nav.Loader size="small" />
              </div>
            )}
            {!isLoading && synlige.length === 0 && (
              <BodyShort size="small" className="tekstblokkSoek__tom">
                Ingen treff.
              </BodyShort>
            )}
            {synlige.map((blokk) => (
              <TekstblokkRad
                key={blokk.id}
                blokk={blokk}
                onVelg={(html) => {
                  onVelg(html);
                  lukk();
                }}
              />
            ))}
          </div>

          {skjult > 0 && (
            <BodyShort size="small" className="tekstblokkSoek__antall">
              {skjult} flere treff – avgrens søket
            </BodyShort>
          )}
        </Popover.Content>
      </Popover>
    </>
  );
}

interface RadProps {
  blokk: TekstblokkOversikt;
  onVelg: (html: string) => void;
}

function TekstblokkRad({ blokk, onVelg }: RadProps) {
  const [erUtvidet, setErUtvidet] = useState(false);
  const [henter, setHenter] = useState(false);
  const queryClient = useQueryClient();
  // enabled: false – innholdet hentes av parent sin chunked prefetch.
  // Hooken subscriber kun til cachen så raden re-rendrer når data lander.
  const innhold = useQuery<Tekstblokker.Tekstblokk>({
    queryKey: tekstblokkerKeys.detalj(blokk.id),
    queryFn: () => Tekstblokker.hent(blokk.id),
    enabled: false,
    staleTime: 5 * 60_000,
  });

  const settInn = async () => {
    if (innhold.data) {
      onVelg(innhold.data.innhold);
      return;
    }
    setHenter(true);
    try {
      const full = await queryClient.fetchQuery({
        queryKey: tekstblokkerKeys.detalj(blokk.id),
        queryFn: () => Tekstblokker.hent(blokk.id),
      });
      onVelg(full.innhold);
    } finally {
      setHenter(false);
    }
  };

  return (
    <div className={`tekstblokkSoek__rad${erUtvidet ? " tekstblokkSoek__rad--utvidet" : ""}`}>
      <div className="tekstblokkSoek__rad-topp">
        <div className="tekstblokkSoek__rad-info">
          <div className="tekstblokkSoek__rad-tittel">{blokk.tittel}</div>
          {blokk.tags.length > 0 && (
            <div className="tekstblokkSoek__rad-tags">
              {blokk.tags.map((tag) => (
                <Nav.Tag key={tag} size="xsmall" variant="neutral">
                  {tag}
                </Nav.Tag>
              ))}
            </div>
          )}
        </div>
        <div className="tekstblokkSoek__rad-knapper">
          <Nav.Button size="xsmall" variant="tertiary" type="button" onClick={() => setErUtvidet(!erUtvidet)}>
            {erUtvidet ? "Skjul" : "Vis hele"}
          </Nav.Button>
          <Nav.Button size="xsmall" variant="primary" type="button" loading={henter} onClick={settInn}>
            Sett inn
          </Nav.Button>
        </div>
      </div>
      <div className={`tekstblokkSoek__forhandsvisning${erUtvidet ? " tekstblokkSoek__forhandsvisning--full" : ""}`}>
        {innhold.isFetching && !innhold.data && <Nav.Loader size="xsmall" />}
        {innhold.isError && !innhold.data && (
          <BodyShort size="small" className="tekstblokkSoek__tom">
            Kunne ikke laste forhåndsvisning
          </BodyShort>
        )}
        {innhold.data && <TekstblokkForhandsvisning html={innhold.data.innhold} />}
      </div>
    </div>
  );
}

export default TekstblokkSoek;
