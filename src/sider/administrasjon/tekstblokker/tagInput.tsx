import { Chips, Label } from "@navikt/ds-react";
import { useRef } from "react";

import * as Nav from "../../../navFrontend";
import { leggTilTag } from "../../../services/modules/tekstblokker";

interface Props {
  verdier: string[];
  setVerdier: (verdier: string[]) => void;
  forslag?: string[];
  // Utkastet eies av forelderen slik at en tag som er skrevet, men ikke lagt til,
  // kan tas med ved lagring i stedet for å gå tapt.
  utkast: string;
  setUtkast: (utkast: string) => void;
}

function TagInput({ verdier, setVerdier, forslag = [], utkast, setUtkast }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Nav.TextField forwarder ikke ref, så vi finner input-feltet via containeren.
  const fokuserFelt = () => containerRef.current?.querySelector("input")?.focus();

  const leggTil = (raa: string) => {
    setVerdier(leggTilTag(verdier, raa));
    setUtkast("");
  };

  // Fra knapp og forslag: behold fokus i feltet, så neste tag kan skrives med én gang.
  const leggTilOgFokuser = (raa: string) => {
    leggTil(raa);
    fokuserFelt();
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
    <div className="tekstblokker__tagInput" ref={containerRef}>
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
      <div className="tekstblokker__tagInput-rad">
        <Nav.TextField
          label="Legg til tag"
          hideLabel
          size="small"
          placeholder="Skriv en tag…"
          value={utkast}
          onChange={(e) => setUtkast(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Nav.Button
          size="small"
          variant="secondary"
          type="button"
          disabled={!utkast.trim()}
          onClick={() => leggTilOgFokuser(utkast)}
        >
          Legg til
        </Nav.Button>
      </div>
      {utkastNormalisert && matchendeForslag.length > 0 && (
        <Chips size="small">
          {matchendeForslag.map((tag) => (
            <Chips.Toggle
              key={tag}
              selected={false}
              aria-label={`Legg til taggen ${tag}`}
              // preventDefault holder fokus i tekstfeltet gjennom hele klikket, så
              // markøren ikke flakker ut og inn igjen når forslaget velges.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => leggTilOgFokuser(tag)}
            >
              {tag}
            </Chips.Toggle>
          ))}
        </Chips>
      )}
    </div>
  );
}

export default TagInput;
