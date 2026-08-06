import { getAsJson } from "../../utils";
import { API_BASE_URL, SAKSBEHANDLING } from "../../api-constants";

// Kodeverk serialiseres av backend som {kode, term}, på samme form som de øvrige
// lovlige-kombinasjoner-endepunktene.
export interface Kodeverdi {
  kode: string;
  term: string;
}

export interface SakstemaNode {
  sakstema: Kodeverdi;
  behandlingstemaer: Kodeverdi[];
}

export interface SakstypeNode {
  sakstype: Kodeverdi;
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

// Unionen over grenene, uten duplikater og med første forekomst av hver kode.
const unike = (koder: Kodeverdi[]): Kodeverdi[] => {
  const sett = new Map<string, Kodeverdi>();
  koder.forEach((k) => {
    if (!sett.has(k.kode)) sett.set(k.kode, k);
  });
  return Array.from(sett.values());
};

export const sakstyperITre = (tre: SakstypeNode[]): Kodeverdi[] => unike(tre.map((node) => node.sakstype));

/**
 * Sakstemaene som er lovlige for minst én av de valgte sakstypene. Uten valgte
 * sakstyper er avgrensningen «alle sakstyper», og da er alle sakstemaer aktuelle.
 */
export const sakstemaerFor = (tre: SakstypeNode[], valgteSakstyper: string[]): Kodeverdi[] =>
  unike(
    tre
      .filter((node) => passerValg(valgteSakstyper, node.sakstype.kode))
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
): Kodeverdi[] =>
  unike(
    tre
      .filter((node) => passerValg(valgteSakstyper, node.sakstype.kode))
      .flatMap((node) => node.sakstemaer)
      .filter((node) => passerValg(valgteSakstemaer, node.sakstema.kode))
      .flatMap((node) => node.behandlingstemaer),
  );

/**
 * Fjerner valg som ikke lenger er lovlige. Brukes når et valg lenger opp i kaskaden
 * snevres inn, slik at en avgrensning ikke blir stående på en kombinasjon som er umulig.
 *
 * Ukjente koder beholdes: en avgrensning lagret på et kodeverk vi ikke lenger kjenner
 * skal ikke forsvinne i det stille bare fordi admin åpnet skjemaet.
 */
export const behold = (valgte: string[], lovlige: Kodeverdi[], kjente: Set<string>): string[] => {
  const lovligeKoder = new Set(lovlige.map((k) => k.kode));
  return valgte.filter((kode) => lovligeKoder.has(kode) || !kjente.has(kode));
};

export const alleKoderITre = (tre: SakstypeNode[]): Set<string> =>
  new Set(
    tre.flatMap((node) => [
      node.sakstype.kode,
      ...node.sakstemaer.flatMap((s) => [s.sakstema.kode, ...s.behandlingstemaer.map((b) => b.kode)]),
    ]),
  );
