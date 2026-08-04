import classNames from "classnames";
import { useMemo } from "react";

import {
  Betingelse,
  erBetingelsesToken,
  erUkjentPlaceholder,
  erValgToken,
  fjernMarkeringsSpans,
  forberedInnhold,
  PLACEHOLDER_BETINGELSE_TITTEL,
  PLACEHOLDER_MARKERINGSKLASSER,
  PLACEHOLDER_UERSTATTET_TITTEL,
  PLACEHOLDER_UERSTATTET_UTEN_VERDIER_TITTEL,
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
// tag- eller avsnittsgrenser. Et alt lagret klamme-span beholdes som det er – regexen
// kan ikke gjenskape markering rundt inline-tagger ([navn <strong>x</strong>]), så å
// strippe spanet først ville mistet markeringen.
const uthevKlammer = (html: string): string =>
  html.replace(/<span class="bracketed-text">[\s\S]*?<\/span>|\[[^[\]<>]*\]/g, (treff) =>
    treff.startsWith("<span") ? treff : `<span class="bracketed-text">${treff}</span>`,
  );

// Samme trevegs-klassifisering som editoren, men uten klikk: forhåndsvisningen viser bare
// at tokenet er et valg.
const markeringFor = (
  token: string,
  gyldigeNokler?: string[],
  harVerdikontekst = false,
): { klasse: string; tittel: string } => {
  if (erBetingelsesToken(token)) return { klasse: "placeholder-betingelse", tittel: PLACEHOLDER_BETINGELSE_TITTEL };
  if (erValgToken(token)) return { klasse: "placeholder-valg", tittel: PLACEHOLDER_VALG_TITTEL_VISNING };
  if (erUkjentPlaceholder(token, gyldigeNokler))
    return { klasse: "placeholder-ukjent", tittel: PLACEHOLDER_UKJENT_TITTEL };
  // Uten verdier å slå opp i (admin) er nøkkelen ikke uten verdi – den er bare ikke løst ennå.
  return {
    klasse: "placeholder-uerstattet",
    tittel: harVerdikontekst ? PLACEHOLDER_UERSTATTET_TITTEL : PLACEHOLDER_UERSTATTET_UTEN_VERDIER_TITTEL,
  };
};

const uthevPlaceholders = (html: string, gyldigeNokler?: string[], harVerdikontekst = false): string =>
  html.replace(/\{[^{}<>\n]+\}/g, (token) => {
    const { klasse, tittel } = markeringFor(token, gyldigeNokler, harVerdikontekst);
    return `<span class="${klasse}" title="${tittel}">${token}</span>`;
  });

function TekstblokkForhandsvisning({ html, className, placeholderVerdier, gyldigeNokler, betingelser }: Props) {
  // Samme gating som editoren: uten togglen finnes ikke placeholder-funksjonen, og
  // {…} skal verken erstattes eller markeres. [klammer] uthevet uansett.
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  // Samme rekkefølge som editoren: erstattede verdier har ingen klammer igjen og
  // treffes derfor ikke av uthevingen etterpå.
  const uthevet = useMemo(() => {
    // Toggle av er master-oppførsel: lagrede klamme-spans beholdes (uthevKlammer kan ikke
    // gjenskape dem rundt inline-tagger), kun placeholder-markeringene strippes. Ved
    // innsetting er stripping trygg uansett – editoren remarkerer klammer tekstbasert.
    if (!dynamiskPlaceholderPaa) return uthevKlammer(fjernMarkeringsSpans(html, PLACEHOLDER_MARKERINGSKLASSER));
    const forberedt = forberedInnhold(html, placeholderVerdier, betingelser);
    return uthevPlaceholders(uthevKlammer(forberedt), gyldigeNokler, placeholderVerdier !== undefined);
  }, [html, placeholderVerdier, gyldigeNokler, betingelser, dynamiskPlaceholderPaa]);
  return (
    <div
      className={classNames("tekstblokk-forhandsvisning", className)}
      dangerouslySetInnerHTML={{ __html: uthevet }}
    />
  );
}

export default TekstblokkForhandsvisning;
