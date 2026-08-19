import { getAsJson } from "../../utils";
import { API_BASE_URL, SAKSBEHANDLING } from "../../api-constants";

// Treet leverer rene koder, ikke {kode, term}: det sammenlignes mot tekstblokkenes
// avgrensning, som også er rene koder, og visningsnavnene finnes i kodeverket vi
// allerede har lokalt. Ett kodeverk å forholde seg til, én kilde til visningsnavn.
export interface SakstemaNode {
  sakstema: string;
  behandlingstemaer: string[];
}

export interface SakstypeNode {
  sakstype: string;
  sakstemaer: SakstemaNode[];
}

/**
 * Hele kombinasjonstreet sakstype -> sakstema -> behandlingstema i ett kall.
 *
 * Treet er saksuavhengig: det er unionen over alle hovedparter og SED, altså alt som er
 * lovlig et eller annet sted. Brukes der man skal kaskadere over flere valg samtidig
 * (avgrensning av tekstblokker i admin), hvor ett kall per kombinasjon ville blitt N*M.
 * Skal ikke brukes til å avgjøre hva som er lovlig i én konkret sak – til det finnes
 * hentSakstemaer/hentBehandlingstemaer.
 *
 * Treet er heller ikke matchingsregelen: passerKontekst i tekstblokker.ts matcher hver
 * dimensjon uavhengig mot sakens verdier, så en avgrensning uten sti i treet gir ingen
 * falske treff – den treffer ingenting. Treet er utfyllingshjelp, ikke en brevregel.
 */
export const hentKombinasjonstre = (): Promise<SakstypeNode[]> =>
  // Et svar som ikke er en liste blir et tomt tre, og behandles da som «ingen kaskade»
  // med varsel – samme utfall som en feilet henting. Sjekken hoerer hjemme her, paa
  // api-grensen, slik at invarianten gjelder enhver konsument og ikke bare den foerste.
  getAsJson(`${API_BASE_URL}${SAKSBEHANDLING}/kombinasjoner/tre`).then((tre: SakstypeNode[]) =>
    Array.isArray(tre) ? tre : [],
  );

// Tomt valg betyr «ingen avgrensning», og skal derfor ikke filtrere bort noe.
const passerValg = (valgte: string[], kode: string): boolean => valgte.length === 0 || valgte.includes(kode);

// Unionen over grenene, uten duplikater og med rekkefølgen fra treet bevart.
const unike = (koder: string[]): string[] => Array.from(new Set(koder));

export const sakstyperITre = (tre: SakstypeNode[]): string[] => unike(tre.map((node) => node.sakstype));

/**
 * Sakstemaene som er lovlige for minst én av de valgte sakstypene. Uten valgte
 * sakstyper er avgrensningen «alle sakstyper», og da er alle sakstemaer aktuelle.
 */
export const sakstemaerFor = (tre: SakstypeNode[], valgteSakstyper: string[]): string[] =>
  unike(
    tre
      .filter((node) => passerValg(valgteSakstyper, node.sakstype))
      .flatMap((node) => node.sakstemaer.map((s) => s.sakstema)),
  );

/**
 * Behandlingstemaene som er lovlige for minst én kombinasjon av de valgte sakstypene og
 * sakstemaene. Unionen, ikke snittet: en tekstblokk som gjelder to sakstyper skal kunne
 * avgrenses til et behandlingstema som bare finnes under den ene.
 */
export const behandlingstemaerFor = (
  tre: SakstypeNode[],
  valgteSakstyper: string[],
  valgteSakstemaer: string[],
): string[] =>
  unike(
    tre
      .filter((node) => passerValg(valgteSakstyper, node.sakstype))
      .flatMap((node) => node.sakstemaer)
      .filter((node) => passerValg(valgteSakstemaer, node.sakstema))
      .flatMap((node) => node.behandlingstemaer),
  );

/**
 * Fjerner valg som ikke lenger er lovlige. Brukes når et valg lenger opp i kaskaden
 * snevres inn, slik at en avgrensning ikke blir stående på en kombinasjon som er umulig.
 *
 * Koder som ikke finnes noe sted i treet beholdes: en avgrensning lagret på et kodeverk
 * treet ikke kjenner skal ikke forsvinne i det stille bare fordi admin åpnet skjemaet.
 */
export const beholdLovlige = (valgte: string[], lovlige: string[], kjenteKoder: Set<string>): string[] => {
  const lovligeKoder = new Set(lovlige);
  return valgte.filter((kode) => lovligeKoder.has(kode) || !kjenteKoder.has(kode));
};

export const alleKoderITre = (tre: SakstypeNode[]): Set<string> =>
  new Set(
    tre.flatMap((node) => [node.sakstype, ...node.sakstemaer.flatMap((s) => [s.sakstema, ...s.behandlingstemaer])]),
  );

export interface Avgrensning {
  sakstyper: string[];
  sakstemaer: string[];
  behandlingstemaer: string[];
}

/** Nivået admin endret. Bestemmer hvor langt ned kaskaden må rydde. */
export type Nivaa = "sakstype" | "sakstema";

export type Ryddenivaa = "sakstema" | "behandlingstema";

export interface Ryddet {
  avgrensning: Avgrensning;
  // Skilt per nivå fordi visningsnavnene ligger i hvert sitt kodeverk.
  fjernet: { sakstemaer: string[]; behandlingstemaer: string[] };
  // Nivåer som gikk fra en avgrensning til tom. Skilles ut fordi et tomt nivå betyr
  // «alle»: konsekvensen er en utvidelse, ikke innsnevringen ryddingen ser ut som.
  toemte: Ryddenivaa[];
}

/**
 * Rydder valgene under nivået som ble endret, og sier fra om hva som forsvant.
 *
 * Med et tomt tre er dette en identitet: `beholdLovlige` beholder alt treet ikke kjenner,
 * og et tomt tre kjenner ingenting. Kallere trenger derfor ingen egen sjekk.
 */
export const ryddNedover = (tre: SakstypeNode[], endret: Nivaa, avgrensning: Avgrensning): Ryddet => {
  const kjenteKoder = alleKoderITre(tre);
  const { sakstyper, sakstemaer, behandlingstemaer } = avgrensning;

  const nyeSakstemaer =
    endret === "sakstype" ? beholdLovlige(sakstemaer, sakstemaerFor(tre, sakstyper), kjenteKoder) : sakstemaer;
  const nyeBehandlingstemaer = beholdLovlige(
    behandlingstemaer,
    behandlingstemaerFor(tre, sakstyper, nyeSakstemaer),
    kjenteKoder,
  );

  const toemt = (foer: string[], etter: string[]): boolean => foer.length > 0 && etter.length === 0;

  return {
    avgrensning: { sakstyper, sakstemaer: nyeSakstemaer, behandlingstemaer: nyeBehandlingstemaer },
    fjernet: {
      sakstemaer: sakstemaer.filter((kode) => !nyeSakstemaer.includes(kode)),
      behandlingstemaer: behandlingstemaer.filter((kode) => !nyeBehandlingstemaer.includes(kode)),
    },
    toemte: [
      ...(toemt(sakstemaer, nyeSakstemaer) ? (["sakstema"] as const) : []),
      ...(toemt(behandlingstemaer, nyeBehandlingstemaer) ? (["behandlingstema"] as const) : []),
    ],
  };
};
