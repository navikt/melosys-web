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
 */
export const hentKombinasjonstre = (): Promise<SakstypeNode[]> =>
  getAsJson(`${API_BASE_URL}${SAKSBEHANDLING}/kombinasjoner/tre`);

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
