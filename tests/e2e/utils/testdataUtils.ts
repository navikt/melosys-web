/**
 * Prepopulerte test-saker i melosys-api database
 * Disse sakene opprettes automatisk ved oppstart av melosys-api (local-mock profil)
 * og kan brukes direkte uten å måtte opprette via UI.
 *
 * Alle saker tilhører testbruker: 30056928150
 *
 * HVER TEST FÅR SIN EGEN UNIKE SAK for full isolasjon (68 saker):
 * MEL-1001 til MEL-1012: opprettAvtalelandSak (12 saker - UNDER_BEHANDLING)
 * MEL-1013 til MEL-1022: opprettUtenforAvtalelandSak (10 saker - UNDER_BEHANDLING)
 * MEL-1023 til MEL-1050: opprettUtenforAvtalelandSakMedAarsavregning (28 årsavregning-saker - UNDER_BEHANDLING)
 * MEL-1051 til MEL-1053: opprettEUEOSSak (3 saker - UNDER_BEHANDLING)
 * MEL-1054 til MEL-1056: opprettEøsPensjonistSakMedTrygdeavgift (3 saker - UNDER_BEHANDLING)
 * MEL-1057 til MEL-1062: OPPRETTET saker for "knytt til eksisterende" tester (6 saker)
 * MEL-1063 til MEL-1068: AVSLUTTET saker for "knytt til eksisterende" tester (6 saker)
 *
 * Metadata for prepopulerte saker - brukes til å konstruere URL-er
 */
const PREPOPULATED_SAK_METADATA = {
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

  // MEL-1057 til MEL-1062: OPPRETTET saker for "knytt til eksisterende" tester (6 saker)
  "MEL-1057": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 57 },
  "MEL-1058": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 58 },
  "MEL-1059": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 59 },
  "MEL-1060": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 60 },
  "MEL-1061": { sakstype: "EU_EOS", behandlingstema: "IKKE_YRKESAKTIV", behandlingID: 61 },
  "MEL-1062": { sakstype: "EU_EOS", behandlingstema: "PENSJONIST", behandlingID: 62 },

  // MEL-1063 til MEL-1068: AVSLUTTET saker for "knytt til eksisterende" tester (6 saker)
  "MEL-1063": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 63 },
  "MEL-1064": { sakstype: "TRYGDEAVTALE", behandlingstema: "YRKESAKTIV", behandlingID: 64 },
  "MEL-1065": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 65 },
  "MEL-1066": { sakstype: "FTRL", behandlingstema: "YRKESAKTIV", behandlingID: 66 },
  "MEL-1067": { sakstype: "EU_EOS", behandlingstema: "IKKE_YRKESAKTIV", behandlingID: 67 },
  "MEL-1068": { sakstype: "EU_EOS", behandlingstema: "PENSJONIST", behandlingID: 68 },
} as const;

/**
 * Union type av alle gyldige prepopulerte saksnummer
 */
export type PrepopulertSaksnummer = keyof typeof PREPOPULATED_SAK_METADATA;

/**
 * Hjelpefunksjon for å få URL til en prepopulert sak
 * @param saksnummer - Saksnummer (f.eks. "MEL-1001")
 * @returns URL til behandlingssiden for saken
 */
export function hentPrepopulertSakUrl(saksnummer: PrepopulertSaksnummer): string {
  const metadata = PREPOPULATED_SAK_METADATA[saksnummer];
  const { sakstype, behandlingstema, behandlingID } = metadata;
  const behandlingstype = "behandlingstype" in metadata ? metadata.behandlingstype : undefined;

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
    // /melosys/:sakstype/saksbehandling/:saksnr?behandlingID=X (default for TRYGDEAVTALE, FTRL, EU_EOS med andre tema)
    url = `/melosys/${sakstype}/saksbehandling/${saksnummer}`;
  }

  return `${url}?behandlingID=${behandlingID}`;
}
