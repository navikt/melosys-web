import classNames from "classnames";
import { useMemo } from "react";

import {
  Betingelse,
  dekodTokenTekst,
  fjernMarkeringsSpans,
  forberedInnhold,
  markeringsklasseFor,
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
  // Nøklene fra betingelseskatalogen; uten dem markeres alle {#hvis …} som betingelse.
  gyldigeBetingelsesNokler?: string[];
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

// Klassifiseringen deles med editoren; kun tittelen er forhåndsvisningens egen – her finnes
// ingen klikk, så valgtittelen kan ikke love et.
const TITTEL_FOR_KLASSE: Record<string, string> = {
  "placeholder-betingelse": PLACEHOLDER_BETINGELSE_TITTEL,
  "placeholder-valg": PLACEHOLDER_VALG_TITTEL_VISNING,
  "placeholder-ukjent": PLACEHOLDER_UKJENT_TITTEL,
};

const uthevPlaceholders = (
  html: string,
  gyldigeNokler?: string[],
  harVerdikontekst = false,
  gyldigeBetingelsesNokler?: string[],
): string =>
  html.replace(/\{[^{}<>\n]+\}/g, (token) => {
    // Klassifiseringen antar dekodet tekst, som editoren ser; her leses HTML-strengen, der
    // Quill kan ha lagret mellomrommet som &nbsp;. Selve tokenet vises uendret.
    const klasse = markeringsklasseFor(dekodTokenTekst(token), gyldigeNokler, gyldigeBetingelsesNokler);
    // Uten verdier å slå opp i (admin) er nøkkelen ikke uten verdi – den er bare ikke løst ennå.
    const tittel =
      TITTEL_FOR_KLASSE[klasse] ??
      (harVerdikontekst ? PLACEHOLDER_UERSTATTET_TITTEL : PLACEHOLDER_UERSTATTET_UTEN_VERDIER_TITTEL);
    return `<span class="${klasse}" title="${tittel}">${token}</span>`;
  });

function TekstblokkForhandsvisning({
  html,
  className,
  placeholderVerdier,
  gyldigeNokler,
  gyldigeBetingelsesNokler,
  betingelser,
}: Props) {
  // Samme gating som editoren: uten togglen finnes ikke placeholder-funksjonen, og
  // {…} skal verken erstattes eller markeres. [klammer] uthevet uansett.
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  // Samme rekkefølge som editoren: erstattede verdier har ingen klammer igjen og
  // treffes derfor ikke av uthevingen etterpå.
  const uthevet = useMemo(() => {
    // Lagrede klamme-spans beholdes i begge toggle-stiene: uthevKlammer kan ikke gjenskape dem
    // rundt inline-tagger, så stripping ville mistet markeringen. Kun innsettingen stripper alt.
    if (!dynamiskPlaceholderPaa) return uthevKlammer(fjernMarkeringsSpans(html, PLACEHOLDER_MARKERINGSKLASSER));
    const forberedt = forberedInnhold(html, placeholderVerdier, betingelser, PLACEHOLDER_MARKERINGSKLASSER);
    return uthevPlaceholders(
      uthevKlammer(forberedt),
      gyldigeNokler,
      placeholderVerdier !== undefined,
      gyldigeBetingelsesNokler,
    );
  }, [html, placeholderVerdier, gyldigeNokler, gyldigeBetingelsesNokler, betingelser, dynamiskPlaceholderPaa]);
  return (
    <div
      className={classNames("tekstblokk-forhandsvisning", className)}
      dangerouslySetInnerHTML={{ __html: uthevet }}
    />
  );
}

export default TekstblokkForhandsvisning;
