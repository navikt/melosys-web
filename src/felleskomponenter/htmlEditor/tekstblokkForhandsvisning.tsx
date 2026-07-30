import classNames from "classnames";
import { useMemo } from "react";

import {
  erstattPlaceholdere,
  fjernMarkeringsSpans,
  PLACEHOLDER_UERSTATTET_TITTEL,
  PlaceholderVerdi,
} from "../../services/modules/placeholdere";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../featuretoggle/toggleNavn";
import "./tekstblokkForhandsvisning.less";

interface Props {
  html: string;
  className?: string;
  // Med verdier viser forhåndsvisningen samme resultat som innsettingen ville gitt.
  placeholderVerdier?: PlaceholderVerdi[];
}

// Speiler editoren: [klammer] rødt, uerstattede {nokkel} gult. Tegnklassene i begge
// utelater < > (og linjeskift) så uthevingen aldri løper over tag- eller avsnittsgrenser.
const uthevKlammer = (html: string): string =>
  html.replace(/\[[^[\]<>]*\]/g, (token) => `<span class="bracketed-text">${token}</span>`);

const uthevPlaceholders = (html: string): string =>
  html.replace(
    /\{[^{}<>\n]+\}/g,
    (token) => `<span class="placeholder-uerstattet" title="${PLACEHOLDER_UERSTATTET_TITTEL}">${token}</span>`,
  );

function TekstblokkForhandsvisning({ html, className, placeholderVerdier }: Props) {
  // Samme gating som editoren: uten togglen finnes ikke placeholder-funksjonen, og
  // {…} skal verken erstattes eller markeres. [klammer] uthevet uansett.
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  // Samme rekkefølge som editoren: erstattede verdier har ingen klammer igjen og
  // treffes derfor ikke av uthevingen etterpå.
  const uthevet = useMemo(() => {
    // Markeringer kan ligge lagret i innholdet; uten opprydding nøstes de opp på hverandre.
    const rentHtml = fjernMarkeringsSpans(html);
    if (!dynamiskPlaceholderPaa) return uthevKlammer(rentHtml);
    const erstattet = placeholderVerdier ? erstattPlaceholdere(rentHtml, placeholderVerdier) : rentHtml;
    return uthevPlaceholders(uthevKlammer(erstattet));
  }, [html, placeholderVerdier, dynamiskPlaceholderPaa]);
  return (
    <div
      className={classNames("tekstblokk-forhandsvisning", className)}
      dangerouslySetInnerHTML={{ __html: uthevet }}
    />
  );
}

export default TekstblokkForhandsvisning;
