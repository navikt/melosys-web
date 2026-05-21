import { Chips, Search, Tabs } from "@navikt/ds-react";

import { TekstblokkType } from "../../../services/modules/tekstblokker";

interface Props {
  type: TekstblokkType;
  setType: (type: TekstblokkType) => void;
  soek: string;
  setSoek: (soek: string) => void;
  valgteTags: string[];
  setValgteTags: (tags: string[]) => void;
  tilgjengeligeTags: Array<[string, number]>;
}

function TekstblokkerFilter({ type, setType, soek, setSoek, valgteTags, setValgteTags, tilgjengeligeTags }: Props) {
  const toggleTag = (tag: string) => {
    if (valgteTags.includes(tag)) {
      setValgteTags(valgteTags.filter((t) => t !== tag));
    } else {
      setValgteTags([...valgteTags, tag]);
    }
  };

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

      {tilgjengeligeTags.length > 0 && (
        <Chips size="small">
          {tilgjengeligeTags.map(([tag, antall]) => (
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
      )}
    </div>
  );
}

export default TekstblokkerFilter;
