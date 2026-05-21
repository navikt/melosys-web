import { BodyShort, Button, Chips, Loader, Popover, Search, Tabs, Tag } from "@navikt/ds-react";
import { useMemo, useRef, useState } from "react";

import * as Tekstblokker from "../../services/modules/tekstblokker";
import { useTekstblokk, useTekstblokker } from "../../services/api/tekstblokker";
import { Tekstblokk as TekstblokkData, TekstblokkOversikt, TekstblokkType } from "../../services/modules/tekstblokker";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../featuretoggle/toggleNavn";
import "./tekstblokkSoek.less";

interface Props {
  onVelg: (html: string) => void;
  disabled?: boolean;
}

const MAKS_SYNLIG = 8;

const matcherSoek = (blokk: TekstblokkOversikt, soek: string): boolean => {
  if (!soek) return true;
  const norm = soek.toLowerCase().trim();
  if (blokk.tittel.toLowerCase().includes(norm)) return true;
  return blokk.tags.some((tag) => tag.toLowerCase().includes(norm));
};

function TekstblokkSoek({ onVelg, disabled }: Props) {
  const togglePaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  const ankerRef = useRef<HTMLDivElement>(null);
  const [aapen, setAapen] = useState(false);
  const [aktivType, setAktivType] = useState<TekstblokkType>("TEKSTBLOKK");
  const [soek, setSoek] = useState("");
  const [valgteTags, setValgteTags] = useState<string[]>([]);
  const [utvidetId, setUtvidetId] = useState<number | null>(null);
  const [henterInnsetting, setHenterInnsetting] = useState<number | null>(null);

  const { data: blokker = [], isLoading } = useTekstblokker(aapen ? aktivType : undefined);
  const utvidet = useTekstblokk(aapen ? utvidetId : null);

  const filtrerteUtenTags = useMemo(() => blokker.filter((b) => matcherSoek(b, soek)), [blokker, soek]);

  const tagAntall = useMemo(() => {
    const teller = new Map<string, number>();
    filtrerteUtenTags.forEach((blokk) => blokk.tags.forEach((tag) => teller.set(tag, (teller.get(tag) ?? 0) + 1)));
    return Array.from(teller.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "nb"));
  }, [filtrerteUtenTags]);

  const filtrerte = useMemo(
    () =>
      valgteTags.length === 0
        ? filtrerteUtenTags
        : filtrerteUtenTags.filter((b) => valgteTags.some((tag) => b.tags.includes(tag))),
    [filtrerteUtenTags, valgteTags],
  );

  const synlige = filtrerte.slice(0, MAKS_SYNLIG);
  const skjult = Math.max(0, filtrerte.length - synlige.length);

  const lukk = () => {
    setAapen(false);
    setSoek("");
    setValgteTags([]);
    setUtvidetId(null);
  };

  const byttType = (verdi: string) => {
    setAktivType(verdi as TekstblokkType);
    setUtvidetId(null);
    setValgteTags([]);
  };

  const toggleTag = (tag: string) => {
    setValgteTags(valgteTags.includes(tag) ? valgteTags.filter((t) => t !== tag) : [...valgteTags, tag]);
  };

  const settInn = async (blokk: TekstblokkOversikt) => {
    setHenterInnsetting(blokk.id);
    try {
      const full: TekstblokkData = await Tekstblokker.hent(blokk.id);
      onVelg(full.innhold);
      lukk();
    } finally {
      setHenterInnsetting(null);
    }
  };

  if (!togglePaa) return null;

  return (
    <>
      <div className="tekstblokkSoek__verktoylinje" ref={ankerRef}>
        <Button
          variant="tertiary"
          size="small"
          onClick={() => (aapen ? lukk() : setAapen(true))}
          disabled={disabled}
          type="button"
        >
          Sett inn tekstblokk/brevmal
        </Button>
      </div>
      <Popover
        open={aapen}
        onClose={lukk}
        anchorEl={ankerRef.current}
        placement="bottom-end"
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
                  <Chips.Toggle key={tag} selected={valgteTags.includes(tag)} onClick={() => toggleTag(tag)}>
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
                <Loader size="small" />
              </div>
            )}
            {!isLoading && synlige.length === 0 && (
              <BodyShort size="small" className="tekstblokkSoek__tom">
                Ingen treff. Lag nye blokker på siden &laquo;Tekstblokker&raquo;.
              </BodyShort>
            )}
            {synlige.map((blokk) => {
              const erUtvidet = utvidetId === blokk.id;
              return (
                <div
                  key={blokk.id}
                  className={`tekstblokkSoek__rad${erUtvidet ? " tekstblokkSoek__rad--utvidet" : ""}`}
                >
                  <div className="tekstblokkSoek__rad-topp">
                    <div className="tekstblokkSoek__rad-info">
                      <div className="tekstblokkSoek__rad-tittel">{blokk.tittel}</div>
                      {blokk.tags.length > 0 && (
                        <div className="tekstblokkSoek__rad-tags">
                          {blokk.tags.map((tag) => (
                            <Tag key={tag} size="xsmall" variant="neutral">
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="tekstblokkSoek__rad-knapper">
                      <Button
                        size="xsmall"
                        variant="tertiary"
                        type="button"
                        onClick={() => setUtvidetId(erUtvidet ? null : blokk.id)}
                      >
                        {erUtvidet ? "Skjul" : "Vis hele"}
                      </Button>
                      <Button
                        size="xsmall"
                        variant="primary"
                        type="button"
                        loading={henterInnsetting === blokk.id}
                        onClick={() => settInn(blokk)}
                      >
                        Sett inn
                      </Button>
                    </div>
                  </div>
                  {erUtvidet && (
                    <div className="tekstblokkSoek__forhandsvisning">
                      {utvidet.isLoading && <Loader size="xsmall" />}
                      {utvidet.data && <div dangerouslySetInnerHTML={{ __html: utvidet.data.innhold }} />}
                    </div>
                  )}
                </div>
              );
            })}
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

export default TekstblokkSoek;
