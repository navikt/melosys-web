import { Page, Locator } from "@playwright/test";
import { SokPage } from "../pages/sok.page";
import { BehandlingPage } from "../pages/behandling/behandling.page";

/**
 * Prepopulerte test-saker i melosys-api database
 * Disse sakene opprettes automatisk ved oppstart av melosys-api (local-mock profil)
 * og kan brukes direkte uten å måtte opprette via UI.
 *
 * Alle saker tilhører testbruker: 30056928150
 *
 * HVER TEST FÅR SIN EGEN UNIKE SAK for full isolasjon (56 saker):
 * MEL-1001 til MEL-1012: opprettAvtalelandSak (12 saker)
 * MEL-1013 til MEL-1022: opprettUtenforAvtalelandSak (10 saker)
 * MEL-1023 til MEL-1050: opprettUtenforAvtalelandSakMedAarsavregning (28 årsavregning-saker)
 * MEL-1051 til MEL-1053: opprettEUEOSSak (3 saker)
 * MEL-1054 til MEL-1056: opprettEøsPensjonistSakMedTrygdeavgift (3 saker)
 */
export const PREPOPULATED_SAKER = {
  /** MEL-1004: EU/EØS - Medlemskap og lovvalg - Ikke yrkesaktiv - Førstegangsbehandling */
  EU_EOS_IKKE_YRKESAKTIV: "MEL-1018",

  /** MEL-1005: EU/EØS - Medlemskap og lovvalg - Pensjonist - Førstegangsbehandling */
  EU_EOS_PENSJONIST: "MEL-1021",

  /** Deprecated - bruk ikke lenger disse, alle tester skal ha sin egen sak */
  AVTALELAND_YRKESAKTIV: "MEL-1001",
  FTRL_YRKESAKTIV: "MEL-1008",
  EU_EOS_TRYGDEAVGIFT_PENSJONIST: "MEL-1022",
  FTRL_AARSAVREGNING: "MEL-1024",
} as const;

/**
 * Metadata for prepopulerte saker - brukes til å konstruere URL-er
 */
const PREPOPULATED_SAK_METADATA: Record<
  string,
  {
    sakstype: "TRYGDEAVTALE" | "FTRL" | "EU_EOS";
    behandlingstema: string;
    behandlingstype?: "ÅRSAVREGNING";
    behandlingID: number;
  }
> = {
  // MEL-1001 til MEL-1012: opprettAvtalelandSak (12 saker)
  "MEL-1001": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 1 },
  "MEL-1002": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 2 },
  "MEL-1003": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 3 },
  "MEL-1004": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 4 },
  "MEL-1005": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 5 },
  "MEL-1006": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 6 },
  "MEL-1007": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 7 },
  "MEL-1008": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 8 },
  "MEL-1009": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 9 },
  "MEL-1010": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 10 },
  "MEL-1011": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 11 },
  "MEL-1012": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 12 },

  // MEL-1013 til MEL-1022: opprettUtenforAvtalelandSak (10 saker)
  "MEL-1013": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 13 },
  "MEL-1014": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 14 },
  "MEL-1015": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 15 },
  "MEL-1016": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 16 },
  "MEL-1017": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 17 },
  "MEL-1018": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 18 },
  "MEL-1019": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 19 },
  "MEL-1020": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 20 },
  "MEL-1021": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 21 },
  "MEL-1022": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 22 },

  // MEL-1023 til MEL-1050: opprettUtenforAvtalelandSakMedAarsavregning (28 årsavregning-saker)
  "MEL-1023": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 23 },
  "MEL-1024": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 24 },
  "MEL-1025": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 25 },
  "MEL-1026": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 26 },
  "MEL-1027": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 27 },
  "MEL-1028": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 28 },
  "MEL-1029": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 29 },
  "MEL-1030": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 30 },
  "MEL-1031": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 31 },
  "MEL-1032": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 32 },
  "MEL-1033": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 33 },
  "MEL-1034": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 34 },
  "MEL-1035": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 35 },
  "MEL-1036": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 36 },
  "MEL-1037": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 37 },
  "MEL-1038": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 38 },
  "MEL-1039": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 39 },
  "MEL-1040": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 40 },
  "MEL-1041": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 41 },
  "MEL-1042": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 42 },
  "MEL-1043": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 43 },
  "MEL-1044": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 44 },
  "MEL-1045": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 45 },
  "MEL-1046": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 46 },
  "MEL-1047": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 47 },
  "MEL-1048": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 48 },
  "MEL-1049": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 49 },
  "MEL-1050": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 50 },

  // MEL-1051 til MEL-1053: opprettEUEOSSak (3 saker)
  "MEL-1051": { sakstype: "EU_EOS", behandlingstema: "IKKE_YRKESAKTIV", behandlingID: 51 },
  "MEL-1052": { sakstype: "EU_EOS", behandlingstema: "IKKE_YRKESAKTIV", behandlingID: 52 },
  "MEL-1053": { sakstype: "EU_EOS", behandlingstema: "IKKE_YRKESAKTIV", behandlingID: 53 },

  // MEL-1054 til MEL-1056: opprettEøsPensjonistSakMedTrygdeavgift (3 saker)
  "MEL-1054": { sakstype: "EU_EOS", behandlingstema: "PENSJONIST", behandlingID: 54 },
  "MEL-1055": { sakstype: "EU_EOS", behandlingstema: "PENSJONIST", behandlingID: 55 },
  "MEL-1056": { sakstype: "EU_EOS", behandlingstema: "PENSJONIST", behandlingID: 56 },
};

/**
 * Hjelpefunksjon for å få URL til en prepopulert sak
 * @param saksnummer - Saksnummer (f.eks. "MEL-1001")
 * @returns URL til behandlingssiden for saken
 */
export function hentPrepopulertSakUrl(saksnummer: string): string {
  const metadata = PREPOPULATED_SAK_METADATA[saksnummer];
  if (!metadata) {
    throw new Error(
      `Ukjent prepopulert saksnummer: ${saksnummer}. ` +
        `Gyldige saksnummer: ${Object.keys(PREPOPULATED_SAK_METADATA).join(", ")}`,
    );
  }

  // Konstruer URL basert på sakstype, behandlingstema og behandlingstype
  // Matcher routing.jsx struktur (med /melosys base path)
  let url: string;

  if (metadata.behandlingstype === "ÅRSAVREGNING") {
    // /melosys/:sakstype/aarsavregning/:saksnr?behandlingID=X
    url = `/melosys/${metadata.sakstype}/aarsavregning/${saksnummer}`;
  } else if (metadata.behandlingstema === "IKKE_YRKESAKTIV") {
    // /melosys/:sakstype/ikkeYrkesaktiv/:saksnr?behandlingID=X
    url = `/melosys/${metadata.sakstype}/ikkeYrkesaktiv/${saksnummer}`;
  } else if (metadata.sakstype === "EU_EOS" && metadata.behandlingstema === "PENSJONIST") {
    // /melosys/EU_EOS/pensjonist/:saksnr?behandlingID=X
    url = `/melosys/EU_EOS/pensjonist/${saksnummer}`;
  } else {
    // /melosys/:sakstype/saksbehandling/:saksnr?behandlingID=X (default for TRYGDEAVTALE, FTRL, EU_EOS med andre tema)
    url = `/melosys/${metadata.sakstype}/saksbehandling/${saksnummer}`;
  }

  return `${url}?behandlingID=${metadata.behandlingID}`;
}

/**
 * Hent prepopulert Avtaleland-sak
 * @param saksnummer - Saksnummer (f.eks. "MEL-1001")
 * @returns URL til behandlingssiden
 */
export async function opprettAvtalelandSak(saksnummer: string): Promise<string> {
  return hentPrepopulertSakUrl(saksnummer);
}

/**
 * Hent prepopulert FTRL-sak
 * @param saksnummer - Saksnummer (f.eks. "MEL-1008")
 * @returns URL til behandlingssiden
 */
export async function opprettUtenforAvtalelandSak(saksnummer: string): Promise<string> {
  return hentPrepopulertSakUrl(saksnummer);
}

/**
 * Avslutt en behandling på en sak
 * @param page - Playwright Page
 * @param sak - Locator for saken (fra finnÅpneSaker eller lignende)
 * @param vedtaksType - Vedtaket som skal registreres (f.eks. "Søknaden er innvilget")
 */
export async function avsluttBehandling(
  page: Page,
  sak: Locator,
  vedtaksType:
    | "Søknaden er innvilget"
    | "Søknaden er avslått"
    | "Avslå søknad pga. manglende opplysninger"
    | "Ferdigbehandlet"
    | "Søknaden/klagen er trukket"
    | "Behandlingen er bortfalt",
): Promise<void> {
  const sokPage = new SokPage(page);
  const sakId = await sokPage.getSaksnummer(sak);

  await sokPage.klikkVisBehandling(sak);
  const behandlingPage = new BehandlingPage(page);
  await behandlingPage.verifiserBehandlingsside();
  await behandlingPage.avsluttBehandling(vedtaksType, sakId);
}

/**
 * Hent prepopulert FTRL-sak med Årsavregning
 * Denne saken har 2 behandlinger: én avsluttet førstegangsbehandling og én åpen årsavregning
 * @param saksnummer - Saksnummer (f.eks. "MEL-1023")
 * @returns URL til behandlingssiden
 */
export async function opprettUtenforAvtalelandSakMedAarsavregning(saksnummer: string): Promise<string> {
  return hentPrepopulertSakUrl(saksnummer);
}

/**
 * Hent prepopulert EU/EØS pensjonist-sak med trygdeavgift
 * Dette er en spesialsak som skal kunne opprette årsavregning selv med åpne behandlinger (MELOSYS-7603)
 * @param saksnummer - Saksnummer (f.eks. "MEL-1021")
 * @returns URL til behandlingssiden
 */
export async function opprettEøsPensjonistSakMedTrygdeavgift(saksnummer: string): Promise<string> {
  return hentPrepopulertSakUrl(saksnummer);
}

/**
 * Hent prepopulert EU/EØS-sak
 * @param saksnummer - Saksnummer (f.eks. "MEL-1018")
 * @returns URL til behandlingssiden
 */
export async function opprettEUEOSSak(saksnummer: string): Promise<string> {
  return hentPrepopulertSakUrl(saksnummer);
}
