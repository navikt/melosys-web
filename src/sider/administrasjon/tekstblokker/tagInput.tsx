import { Chips, Label } from "@navikt/ds-react";
import { useState } from "react";

import * as Nav from "../../../navFrontend";

interface Props {
  verdier: string[];
  setVerdier: (verdier: string[]) => void;
  forslag?: string[];
}

function TagInput({ verdier, setVerdier, forslag = [] }: Props) {
  const [utkast, setUtkast] = useState("");

  // Bevar bokstavstørrelse (f.eks. "USA-avtale") og tillat mellomrom i tags.
  const leggTil = (raa: string) => {
    const ny = raa.trim().replace(/\s+/g, " ");
    const finnesAllerede = verdier.some((t) => t.toLowerCase() === ny.toLowerCase());
    if (!ny || finnesAllerede) {
      setUtkast("");
      return;
    }
    setVerdier([...verdier, ny]);
    setUtkast("");
  };

  const fjern = (tag: string) => setVerdier(verdier.filter((t) => t !== tag));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Kun komma/Enter legger til. Mellomrom skal kunne være del av en tag.
    // Backspace med tomt felt gjør bevisst ingenting – tidligere slettet det tags utilsiktet.
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      leggTil(utkast);
    }
  };

  const utkastNormalisert = utkast.trim().toLowerCase();
  const matchendeForslag = forslag
    .filter(
      (tag) =>
        !verdier.some((v) => v.toLowerCase() === tag.toLowerCase()) && tag.toLowerCase().includes(utkastNormalisert),
    )
    .slice(0, 6);

  return (
    <div className="tekstblokker__tagInput">
      <Label size="small">Tags</Label>
      <div className="tekstblokker__tagInput-chips">
        {verdier.length === 0 && <span className="tekstblokker__tagInput-tom">Ingen tags lagt til</span>}
        <Chips size="small">
          {verdier.map((tag) => (
            <Chips.Removable key={tag} variant="neutral" onClick={() => fjern(tag)}>
              {tag}
            </Chips.Removable>
          ))}
        </Chips>
      </div>
      <Nav.TextField
        label="Legg til tag"
        hideLabel
        size="small"
        placeholder="Skriv en tag og trykk Enter…"
        value={utkast}
        onChange={(e) => setUtkast(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => leggTil(utkast)}
      />
      {utkastNormalisert && matchendeForslag.length > 0 && (
        <Chips size="small">
          {matchendeForslag.map((tag) => (
            <Chips.Toggle key={tag} selected={false} onClick={() => leggTil(tag)}>
              {tag}
            </Chips.Toggle>
          ))}
        </Chips>
      )}
    </div>
  );
}

export default TagInput;
