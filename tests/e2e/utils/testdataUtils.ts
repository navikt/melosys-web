/**
 * Test-saker i melosys-api database for Playwright e2e-tester.
 * Metadata hentes dynamisk fra backend via /internal/e2e/testdata/reset.
 *
 * Alle saker tilhører testbruker: 30056928150
 *
 * HVER TEST FÅR SIN EGEN UNIKE SAK for full isolasjon (71 saker):
 * MEL-1001 til MEL-1011: Avtaleland UNDER_BEHANDLING (11 saker)
 * MEL-1012: Avtaleland OPPRETTET (1 sak)
 * MEL-1013 til MEL-1022: Utenfor avtaleland UNDER_BEHANDLING (10 saker)
 * MEL-1023 til MEL-1050: Utenfor avtaleland med årsavregning (28 saker)
 * MEL-1051 til MEL-1053: EU/EØS IKKE_YRKESAKTIV UNDER_BEHANDLING (3 saker)
 * MEL-1054 til MEL-1056: EU/EØS Pensjonist med trygdeavgift (3 saker)
 * MEL-1057 til MEL-1062: OPPRETTET saker for "knytt til eksisterende" tester (6 saker)
 * MEL-1063 til MEL-1068: AVSLUTTET saker for "knytt til eksisterende" tester (6 saker)
 * MEL-1069: Avtaleland for varselmelding-test (1 sak)
 * MEL-1070: Utenfor avtaleland AVSLUTTET (1 sak)
 * MEL-1071: EU/EØS IKKE_YRKESAKTIV for regresjon-test (1 sak)
 * MEL-1072 til MEL-1073: EU/EØS Pensjonist med trygdeavgift - ekstra for parallelle E2E-tester (2 saker)
 * MEL-1074: FTRL Pensjonist med trygdeavgift (AC3: helse/pensjonsdel-splitting)
 */

import { existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

/**
 * Metadata for en test-sak fra backend
 */
interface SakMetadata {
  behandlingID: number;
  sakstype: string;
  sakstema: string;
  behandlingstema: string;
  behandlingstype: string;
  behandlingsstatus: string;
}

/**
 * Respons fra /internal/e2e/testdata/reset
 */
interface ResetResponse {
  status: string;
  cleared: number;
  created: number;
  wasReset: boolean;
  testFnr: string;
  caseRange: string;
  metadata: Record<string, SakMetadata>;
  message: string;
}

/**
 * Cache for metadata hentet fra backend
 */
let cachedMetadata: Record<string, SakMetadata> | null = null;

/**
 * Laster metadata fra fil (skrevet av globalSetup)
 */
function loadMetadataFromFile(): Record<string, SakMetadata> | null {
  try {
    const metadataPath = join(tmpdir(), "melosys-e2e-testdata-metadata.json");
    if (existsSync(metadataPath)) {
      const content = readFileSync(metadataPath, "utf-8");
      return JSON.parse(content);
    }
  } catch {
    // Ignorer feil - metadata må hentes via resetTestData()
  }
  return null;
}

/**
 * Alle gyldige saksnummer for prepopulerte test-saker.
 * Brukes for å utlede typen PrepopulertSaksnummer.
 */
const ALL_SAKSNUMMER = [
  // MEL-1001 til MEL-1011: Avtaleland UNDER_BEHANDLING
  "MEL-1001",
  "MEL-1002",
  "MEL-1003",
  "MEL-1004",
  "MEL-1005",
  "MEL-1006",
  "MEL-1007",
  "MEL-1008",
  "MEL-1009",
  "MEL-1010",
  "MEL-1011",
  // MEL-1012: Avtaleland OPPRETTET
  "MEL-1012",
  // MEL-1013 til MEL-1022: Utenfor avtaleland UNDER_BEHANDLING
  "MEL-1013",
  "MEL-1014",
  "MEL-1015",
  "MEL-1016",
  "MEL-1017",
  "MEL-1018",
  "MEL-1019",
  "MEL-1020",
  "MEL-1021",
  "MEL-1022",
  // MEL-1023 til MEL-1050: Utenfor avtaleland med årsavregning
  "MEL-1023",
  "MEL-1024",
  "MEL-1025",
  "MEL-1026",
  "MEL-1027",
  "MEL-1028",
  "MEL-1029",
  "MEL-1030",
  "MEL-1031",
  "MEL-1032",
  "MEL-1033",
  "MEL-1034",
  "MEL-1035",
  "MEL-1036",
  "MEL-1037",
  "MEL-1038",
  "MEL-1039",
  "MEL-1040",
  "MEL-1041",
  "MEL-1042",
  "MEL-1043",
  "MEL-1044",
  "MEL-1045",
  "MEL-1046",
  "MEL-1047",
  "MEL-1048",
  "MEL-1049",
  "MEL-1050",
  // MEL-1051 til MEL-1053: EU/EØS IKKE_YRKESAKTIV
  "MEL-1051",
  "MEL-1052",
  "MEL-1053",
  // MEL-1054 til MEL-1056: EU/EØS Pensjonist med trygdeavgift
  "MEL-1054",
  "MEL-1055",
  "MEL-1056",
  // MEL-1057 til MEL-1062: OPPRETTET saker
  "MEL-1057",
  "MEL-1058",
  "MEL-1059",
  "MEL-1060",
  "MEL-1061",
  "MEL-1062",
  // MEL-1063 til MEL-1068: AVSLUTTET saker
  "MEL-1063",
  "MEL-1064",
  "MEL-1065",
  "MEL-1066",
  "MEL-1067",
  "MEL-1068",
  // MEL-1069 til MEL-1073: Diverse
  "MEL-1069",
  "MEL-1070",
  "MEL-1071",
  "MEL-1072",
  "MEL-1073",
  // MEL-1074: FTRL Pensjonist med trygdeavgift (AC3)
  "MEL-1074",
] as const;

export type PrepopulertSaksnummer = (typeof ALL_SAKSNUMMER)[number];

/**
 * Resetter testdata i backend og henter oppdatert metadata.
 * Kall denne i globalSetup eller før test-suiten starter.
 *
 * @returns Metadata for alle test-saker inkludert behandlings-ID-er
 */
export async function resetTestData(): Promise<Record<string, SakMetadata>> {
  /* eslint-disable-next-line no-console */
  console.log("Resetting test data via /internal/e2e/testdata/reset...");

  const response = await fetch(`${API_BASE_URL}/internal/e2e/testdata/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to reset test data: ${response.status} ${errorText}`);
  }

  const data: ResetResponse = await response.json();

  if (data.status !== "OK") {
    throw new Error(`Reset failed: ${data.message}`);
  }

  /* eslint-disable-next-line no-console */
  console.log(`Test data reset complete: ${data.message}`);
  cachedMetadata = data.metadata;
  return data.metadata;
}

/**
 * Henter cached metadata. Prøver først fra cache, deretter fra fil.
 */
function getMetadata(): Record<string, SakMetadata> {
  if (!cachedMetadata) {
    // Prøv å laste fra fil (skrevet av globalSetup)
    cachedMetadata = loadMetadataFromFile();
  }
  if (!cachedMetadata) {
    throw new Error("Test metadata not initialized. Ensure globalSetup has run or call resetTestData() first.");
  }
  return cachedMetadata;
}

/**
 * Henter metadata for en spesifikk sak
 */
export function hentSakMetadata(saksnummer: PrepopulertSaksnummer): SakMetadata {
  const metadata = getMetadata();
  const sakMetadata = metadata[saksnummer];
  if (!sakMetadata) {
    throw new Error(`No metadata found for ${saksnummer}. Available: ${Object.keys(metadata).join(", ")}`);
  }
  return sakMetadata;
}

/**
 * Hjelpefunksjon for å få URL til en test-sak
 * @param saksnummer - Saksnummer (f.eks. "MEL-1001")
 * @returns URL til behandlingssiden for saken
 */
export function hentPrepopulertSakUrl(saksnummer: PrepopulertSaksnummer): string {
  const metadata = hentSakMetadata(saksnummer);
  const { sakstype, behandlingstema, behandlingstype, behandlingID } = metadata;

  // Konstruer URL basert på sakstype, behandlingstema og behandlingstype
  // Matcher routing.jsx struktur (med /melosys base path)
  let url: string;

  if (behandlingstype === "ÅRSAVREGNING") {
    // /melosys/:sakstype/aarsavregning/:saksnr?behandlingID=X
    url = `/melosys/${sakstype}/aarsavregning/${saksnummer}`;
  } else if (behandlingstema === "IKKE_YRKESAKTIV") {
    // /melosys/:sakstype/ikkeYrkesaktiv/:saksnr?behandlingID=X
    url = `/melosys/${sakstype}/ikkeYrkesaktiv/${saksnummer}`;
  } else if (sakstype === "EU_EOS" && behandlingstema === "PENSJONIST") {
    // /melosys/EU_EOS/pensjonist/:saksnr?behandlingID=X
    url = `/melosys/EU_EOS/pensjonist/${saksnummer}`;
  } else {
    // /melosys/:sakstype/saksbehandling/:saksnr?behandlingID=X
    url = `/melosys/${sakstype}/saksbehandling/${saksnummer}`;
  }

  return `${url}?behandlingID=${behandlingID}`;
}
