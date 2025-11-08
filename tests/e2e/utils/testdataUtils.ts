import { Page, Locator } from "@playwright/test";
import { SokPage } from "../pages/sok.page";
import { BehandlingPage } from "../pages/behandling/behandling.page";

/**
 * Prepopulerte test-saker i melosys-api database
 * Disse sakene opprettes automatisk ved oppstart av melosys-api (local-mock profil)
 * og kan brukes direkte uten å måtte opprette via UI.
 *
 * Alle saker tilhører testbruker: 30056928150
 */
export const PREPOPULATED_SAKER = {
  /** MEL-1001: Avtaleland - Yrkesaktiv - Førstegangsbehandling */
  AVTALELAND_YRKESAKTIV: "MEL-1001",

  /** MEL-1002: Utenfor avtaleland (FTRL) - Yrkesaktiv - Førstegangsbehandling */
  FTRL_YRKESAKTIV: "MEL-1002",

  /** MEL-1003: EU/EØS - Trygdeavgift - Pensjonist - Førstegangsbehandling */
  EU_EOS_TRYGDEAVGIFT_PENSJONIST: "MEL-1003",

  /** MEL-1004: EU/EØS - Medlemskap og lovvalg - Ikke yrkesaktiv - Førstegangsbehandling */
  EU_EOS_IKKE_YRKESAKTIV: "MEL-1004",

  /** MEL-1005: EU/EØS - Medlemskap og lovvalg - Pensjonist - Førstegangsbehandling */
  EU_EOS_PENSJONIST: "MEL-1005",

  /** MEL-1006: Utenfor avtaleland (FTRL) - Yrkesaktiv - Årsavregning (2 behandlinger: avsluttet + åpen) */
  FTRL_AARSAVREGNING: "MEL-1006",
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
  "MEL-1001": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 1 },
  "MEL-1002": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 2 },
  "MEL-1003": { sakstype: "EU_EOS", behandlingstema: "PENSJONIST", behandlingID: 3 },
  "MEL-1004": { sakstype: "EU_EOS", behandlingstema: "IKKE_YRKESAKTIV", behandlingID: 4 },
  "MEL-1005": { sakstype: "EU_EOS", behandlingstema: "PENSJONIST", behandlingID: 5 },
  "MEL-1006": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingstype: "ÅRSAVREGNING", behandlingID: 6 },
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
 * Hent prepopulert Avtaleland-sak (MEL-1001)
 * @returns URL til behandlingssiden
 */
export async function opprettAvtalelandSak(): Promise<string> {
  return hentPrepopulertSakUrl(PREPOPULATED_SAKER.AVTALELAND_YRKESAKTIV);
}

/**
 * Hent prepopulert FTRL-sak (MEL-1002)
 * @returns URL til behandlingssiden
 */
export async function opprettUtenforAvtalelandSak(): Promise<string> {
  return hentPrepopulertSakUrl(PREPOPULATED_SAKER.FTRL_YRKESAKTIV);
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
 * Hent prepopulert FTRL-sak med Årsavregning (MEL-1006)
 * Denne saken har 2 behandlinger: én avsluttet førstegangsbehandling og én åpen årsavregning
 * @returns URL til behandlingssiden
 */
export async function opprettUtenforAvtalelandSakMedAarsavregning(): Promise<string> {
  return hentPrepopulertSakUrl(PREPOPULATED_SAKER.FTRL_AARSAVREGNING);
}

/**
 * Hent prepopulert EU/EØS pensjonist-sak med trygdeavgift (MEL-1003)
 * Dette er en spesialsak som skal kunne opprette årsavregning selv med åpne behandlinger (MELOSYS-7603)
 * @returns URL til behandlingssiden
 */
export async function opprettEøsPensjonistSakMedTrygdeavgift(): Promise<string> {
  return hentPrepopulertSakUrl(PREPOPULATED_SAKER.EU_EOS_TRYGDEAVGIFT_PENSJONIST);
}

/**
 * Hent prepopulert EU/EØS-sak med spesifisert behandlingstema
 * @param behandlingstema - F.eks. "Ikke yrkesaktiv" (default)
 * @returns URL til behandlingssiden
 */
export async function opprettEUEOSSak(
  behandlingstema:
    | "Utsendt arbeidstaker / skip / direkte til artikkel 16"
    | "Utsendt selvstendig næringsdrivende / skip / direkte til artikkel 16"
    | "Arbeid og/eller selvstendig virksomhet i flere land"
    | "Offentlig tjenesteperson/flyvende personell"
    | "Arbeid kun i Norge"
    | "Ikke yrkesaktiv"
    | "Pensjonist/uføretrygdet"
    | "Forespørsel fra trygdemyndighet"
    | "Forespørsel om trygdetid" = "Ikke yrkesaktiv",
): Promise<string> {
  // Map behandlingstema til prepopulert saksnummer
  let saksnummer: string;
  switch (behandlingstema) {
    case "Ikke yrkesaktiv":
      saksnummer = PREPOPULATED_SAKER.EU_EOS_IKKE_YRKESAKTIV;
      break;
    case "Pensjonist/uføretrygdet":
      saksnummer = PREPOPULATED_SAKER.EU_EOS_PENSJONIST;
      break;
    default:
      throw new Error(
        `Ingen prepopulert sak for behandlingstema: "${behandlingstema}". ` +
          `Støttede varianter: "Ikke yrkesaktiv", "Pensjonist/uføretrygdet"`,
      );
  }

  return hentPrepopulertSakUrl(saksnummer);
}
