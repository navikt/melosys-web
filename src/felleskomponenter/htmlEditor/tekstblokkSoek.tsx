import { BodyShort, Chips, Popover, Search, Tabs } from "@navikt/ds-react";
import { useMemo, useRef, useState } from "react";

import * as Nav from "../../navFrontend";
import { useFiltrerteTekstblokker, useTekstblokker } from "../../services/api/tekstblokker";
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
const MAKS_TAGS_KOMPAKT = 10;

function TekstblokkSoek({ onVelg, disabled }: Props) {
  const togglePaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  if (!togglePaa) return null;
  return <TekstblokkSoekIntern onVelg={onVelg} disabled={disabled} />;
}

function TekstblokkSoekIntern({ onVelg, disabled }: Props) {
  const ankerRef = useRef<HTMLDivElement>(null);
  const [aapen, setAapen] = useState(false);
  const [aktivType, setAktivType] = useState<TekstblokkType>("TEKSTBLOKK");
  const [soek, setSoek] = useState("");
  const [valgteTags, setValgteTags] = useState<string[]>([]);
  const [visAlleTags, setVisAlleTags] = useState(false);

  const { data: blokker = [], isLoading } = useTekstblokker(aktivType, aapen);

  const { tagAntall, synlige: filtrerte } = useFiltrerteTekstblokker(blokker, soek, valgteTags);

  // Vis kun de mest brukte tagene i kompakt modus, men la valgte tags alltid være synlige.
  const synligeTags = useMemo(() => {
    if (visAlleTags) return tagAntall;
    const topp = tagAntall.slice(0, MAKS_TAGS_KOMPAKT);
    const valgteUtenfor = tagAntall.filter(([tag]) => valgteTags.includes(tag) && !topp.some(([t]) => t === tag));
    return [...topp, ...valgteUtenfor];
  }, [tagAntall, visAlleTags, valgteTags]);
  const skjulteTags = tagAntall.length - synligeTags.length;

  const synlige = filtrerte.slice(0, MAKS_SYNLIG);
  const skjult = Math.max(0, filtrerte.length - synlige.length);

  const lukk = () => {
    setAapen(false);
    setSoek("");
    setValgteTags([]);
  };

  const byttType = (verdi: string) => {
    setAktivType(verdi as TekstblokkType);
    setValgteTags([]);
    setVisAlleTags(false);
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
          Sett inn tekstblokk/brevmal
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
                {synligeTags.map(([tag, antall]) => (
                  <Chips.Toggle
                    key={tag}
                    selected={valgteTags.includes(tag)}
                    onClick={() => setValgteTags(toggleITegnliste(valgteTags, tag))}
                  >
                    {`${tag} (${antall})`}
                  </Chips.Toggle>
                ))}
                {!visAlleTags && skjulteTags > 0 && (
                  <Chips.Toggle selected={false} onClick={() => setVisAlleTags(true)}>
                    {`+${skjulteTags} flere`}
                  </Chips.Toggle>
                )}
                {visAlleTags && (
                  <Chips.Toggle selected={false} onClick={() => setVisAlleTags(false)}>
                    Vis færre
                  </Chips.Toggle>
                )}
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
          <Nav.Button size="xsmall" variant="primary" type="button" onClick={() => onVelg(blokk.innhold)}>
            Sett inn
          </Nav.Button>
        </div>
      </div>
      <div className={`tekstblokkSoek__forhandsvisning${erUtvidet ? " tekstblokkSoek__forhandsvisning--full" : ""}`}>
        <TekstblokkForhandsvisning html={blokk.innhold} />
      </div>
    </div>
  );
}

export default TekstblokkSoek;
