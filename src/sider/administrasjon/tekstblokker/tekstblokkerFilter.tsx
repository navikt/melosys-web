import { Chips, Search, Tabs } from "@navikt/ds-react";
import { useMemo, useState } from "react";

import * as Nav from "../../../navFrontend";
import { erTagValgt, Statusfilter, TekstblokkType, toggleITagliste } from "../../../services/modules/tekstblokker";

const MAKS_TAGS_KOMPAKT = 15;

const STATUSVALG: Array<[Statusfilter, string]> = [
  ["ALLE", "Alle"],
  ["PUBLISERT", "Publiserte"],
  ["UTKAST", "Utkast"],
];

interface Props {
  type: TekstblokkType;
  setType: (type: TekstblokkType) => void;
  soek: string;
  setSoek: (soek: string) => void;
  valgteTags: string[];
  setValgteTags: (tags: string[]) => void;
  tilgjengeligeTags: Array<[string, number]>;
  statusfilter: Statusfilter;
  setStatusfilter: (statusfilter: Statusfilter) => void;
}

function TekstblokkerFilter({
  type,
  setType,
  soek,
  setSoek,
  valgteTags,
  setValgteTags,
  tilgjengeligeTags,
  statusfilter,
  setStatusfilter,
}: Props) {
  const [visAlleTags, setVisAlleTags] = useState(false);

  // Vis de mest brukte tagene i kompakt modus, men hold valgte tags alltid synlige.
  const synligeTags = useMemo(() => {
    if (visAlleTags) return tilgjengeligeTags;
    const topp = tilgjengeligeTags.slice(0, MAKS_TAGS_KOMPAKT);
    const valgteUtenfor = tilgjengeligeTags.filter(
      ([tag]) => erTagValgt(valgteTags, tag) && !topp.some(([t]) => t === tag),
    );
    return [...topp, ...valgteUtenfor];
  }, [tilgjengeligeTags, visAlleTags, valgteTags]);
  const skjulteTags = tilgjengeligeTags.length - synligeTags.length;

  return (
    <div className="tekstblokker__filter">
      <Tabs value={type} onChange={(v) => setType(v as TekstblokkType)} size="small">
        <Tabs.List>
          <Tabs.Tab value="TEKSTBLOKK" label="Tekstblokker" />
          <Tabs.Tab value="BREVMAL" label="Brevmaler" />
        </Tabs.List>
      </Tabs>

      <Search
        label="Søk i tekstblokker"
        hideLabel
        placeholder="Søk på tittel eller tag…"
        size="small"
        value={soek}
        onChange={setSoek}
        variant="simple"
      />

      {/* Status står for seg selv med egen ledetekst, så den ikke leses som enda en tag. */}
      <div className="tekstblokker__statusfilter">
        <Nav.BodyShort size="small">Status:</Nav.BodyShort>
        <Chips size="small">
          {STATUSVALG.map(([verdi, label]) => (
            <Chips.Toggle key={verdi} selected={statusfilter === verdi} onClick={() => setStatusfilter(verdi)}>
              {label}
            </Chips.Toggle>
          ))}
        </Chips>
      </div>

      {tilgjengeligeTags.length > 0 && (
        <Chips size="small">
          {synligeTags.map(([tag, antall]) => (
            <Chips.Toggle
              key={tag}
              selected={erTagValgt(valgteTags, tag)}
              onClick={() => setValgteTags(toggleITagliste(valgteTags, tag))}
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
      )}
    </div>
  );
}

export default TekstblokkerFilter;
