import classNames from "classnames";
import { useMemo } from "react";

import {
  Betingelse,
  erBetingelsesToken,
  erstattPlaceholdere,
  erUkjentPlaceholder,
  erValgToken,
  fjernMarkeringsSpans,
  losOppBetingelser,
  PLACEHOLDER_BETINGELSE_TITTEL,
  PLACEHOLDER_MARKERINGSKLASSER,
  PLACEHOLDER_UERSTATTET_TITTEL,
  PLACEHOLDER_UKJENT_TITTEL,
  PLACEHOLDER_VALG_TITTEL_VISNING,
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
  // Nøklene fra placeholder-katalogen; uten dem markeres alle uerstattede nøkler gult.
  gyldigeNokler?: string[];
  // Med betingelser løses {#hvis …} opp som ved innsetting; uten dem markeres tokenene.
  betingelser?: Betingelse[];
}

// Speiler editoren: [klammer] rødt, uerstattede {nokkel} gult, ukjente nøkler røde.
// Tegnklassene i begge utelater < > (og linjeskift) så uthevingen aldri løper over
// tag- eller avsnittsgrenser.
// Lagret klammemarkering hoppes over: regexen kan ikke gjenskape den rundt inline-tagger.
const uthevKlammer = (html: string): string =>
  html.replace(/<span class="bracketed-text">[\s\S]*?<\/span>|\[[^[\]<>]*\]/g, (treff) =>
    treff.startsWith("[") ? `<span class="bracketed-text">${treff}</span>` : treff,
  );

// Samme trevegs-klassifisering som editoren, men uten klikk: forhåndsvisningen viser bare
// at tokenet er et valg.
const markeringFor = (token: string, gyldigeNokler?: string[]): { klasse: string; tittel: string } => {
  if (erBetingelsesToken(token)) return { klasse: "placeholder-betingelse", tittel: PLACEHOLDER_BETINGELSE_TITTEL };
  if (erValgToken(token)) return { klasse: "placeholder-valg", tittel: PLACEHOLDER_VALG_TITTEL_VISNING };
  if (erUkjentPlaceholder(token, gyldigeNokler))
    return { klasse: "placeholder-ukjent", tittel: PLACEHOLDER_UKJENT_TITTEL };
  return { klasse: "placeholder-uerstattet", tittel: PLACEHOLDER_UERSTATTET_TITTEL };
};

const uthevPlaceholders = (html: string, gyldigeNokler?: string[]): string =>
  html.replace(/\{[^{}<>\n]+\}/g, (token) => {
    const { klasse, tittel } = markeringFor(token, gyldigeNokler);
    return `<span class="${klasse}" title="${tittel}">${token}</span>`;
  });

function TekstblokkForhandsvisning({ html, className, placeholderVerdier, gyldigeNokler, betingelser }: Props) {
  // Samme gating som editoren: uten togglen finnes ikke placeholder-funksjonen, og
  // {…} skal verken erstattes eller markeres. [klammer] uthevet uansett.
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  // Samme rekkefølge som editoren: erstattede verdier har ingen klammer igjen og
  // treffes derfor ikke av uthevingen etterpå.
  const uthevet = useMemo(() => {
    // Markeringer kan ligge lagret i innholdet; uten opprydding nøstes de opp på hverandre.
    const rentHtml = fjernMarkeringsSpans(html, PLACEHOLDER_MARKERINGSKLASSER);
    if (!dynamiskPlaceholderPaa) return uthevKlammer(rentHtml);
    const lost = losOppBetingelser(rentHtml, betingelser);
    const erstattet = placeholderVerdier ? erstattPlaceholdere(lost, placeholderVerdier) : lost;
    return uthevPlaceholders(uthevKlammer(erstattet), gyldigeNokler);
  }, [html, placeholderVerdier, gyldigeNokler, betingelser, dynamiskPlaceholderPaa]);
  return (
    <div
      className={classNames("tekstblokk-forhandsvisning", className)}
      dangerouslySetInnerHTML={{ __html: uthevet }}
    />
  );
}

export default TekstblokkForhandsvisning;
