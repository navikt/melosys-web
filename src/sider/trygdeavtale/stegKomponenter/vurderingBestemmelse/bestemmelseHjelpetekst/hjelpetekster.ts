enum Hjelpetekster {
  MEDLEM_I_FOLKETRYGDEN = "Søker er medlem i folketrygden på utsendingstidspunktet.",
  BOSATT_I_NORGE = "Søker er bosatt i Norge.",
  ANSATT_OG_LØNNET_FRA_NORSK_ARBEIDSGIVER = "Søker er ansatt og lønnet av norsk arbeidsgiver.",
  LØNNET_FRA_NORSK_ARBEIDSGIVER = "Søker er lønnet fra norsk arbeidsgiver.",
  ARBEIDER_PÅ_NORSKREGISTRERT_SKIP = "Søker arbeider på et norskregistrert skip.",
  ARBEIDER_PÅ_BRISTISKREGISTRERT_SKIP = "Søker arbeider på et britiskregistrert skip.",
  ANSATT_I_DEN_NORSKE_STAT = "Søker er ansatt i den norske stats tjeneste.",
  NORSK_STATSBORGER = "Søker er norsk statsborger.",
  PLIKTIG_TRYGDET_BEGGE_LAND = "Søker er på grunnlag av arbeidsforholdet pliktig trygdet etter begge lands lovgivning.",
  MAX_TRE_ÅR = "Utsendingen forventes ikke å vare mer enn tre år.",
  MAX_FEM_ÅR = "Utsendingen forventes ikke å vare mer enn fem år.",
  MAX_12_MD = "Utenlandsoppholdet forventes ikke å vare mer enn 12 måneder.",
  UTSENDT_FOR_ARBEID = "Søker er utsendt for å arbeide.",
}

const hjelpeteksterUkArt61 = [
  Hjelpetekster.MEDLEM_I_FOLKETRYGDEN,
  Hjelpetekster.LØNNET_FRA_NORSK_ARBEIDSGIVER,
  Hjelpetekster.MAX_TRE_ÅR,
];

const hjelpeteksterUkArt65 = [Hjelpetekster.BOSATT_I_NORGE, Hjelpetekster.LØNNET_FRA_NORSK_ARBEIDSGIVER];

const hjelpeteksterUkArt73 = [
  Hjelpetekster.BOSATT_I_NORGE,
  Hjelpetekster.ANSATT_OG_LØNNET_FRA_NORSK_ARBEIDSGIVER,
  Hjelpetekster.ARBEIDER_PÅ_BRISTISKREGISTRERT_SKIP,
];

const hjelpeteksterUkArt82 = [
  Hjelpetekster.ANSATT_I_DEN_NORSKE_STAT,
  Hjelpetekster.ANSATT_OG_LØNNET_FRA_NORSK_ARBEIDSGIVER,
];

const hjelpeteksterUsArt52 = [
  Hjelpetekster.MEDLEM_I_FOLKETRYGDEN,
  Hjelpetekster.LØNNET_FRA_NORSK_ARBEIDSGIVER,
  Hjelpetekster.MAX_FEM_ÅR,
];

const hjelpeteksterUsArt54 = [Hjelpetekster.BOSATT_I_NORGE, Hjelpetekster.MAX_12_MD];

const hjelpeteksterUsArt55 = [
  Hjelpetekster.ANSATT_I_DEN_NORSKE_STAT,
  Hjelpetekster.ANSATT_OG_LØNNET_FRA_NORSK_ARBEIDSGIVER,
  Hjelpetekster.NORSK_STATSBORGER,
];

const hjelpeteksterUsArt56 = [Hjelpetekster.ARBEIDER_PÅ_NORSKREGISTRERT_SKIP, Hjelpetekster.PLIKTIG_TRYGDET_BEGGE_LAND];

const hjelpeteksterCaArt62 = [Hjelpetekster.BOSATT_I_NORGE, Hjelpetekster.MAX_12_MD];

const hjelpeteksterCaArt7 = [
  Hjelpetekster.MEDLEM_I_FOLKETRYGDEN,
  Hjelpetekster.LØNNET_FRA_NORSK_ARBEIDSGIVER,
  Hjelpetekster.MAX_FEM_ÅR,
];

const hjelpeteksterCaArt9 = ["placeholder"];

const hjelpeteksterCaArt10 = [
  Hjelpetekster.ANSATT_I_DEN_NORSKE_STAT,
  Hjelpetekster.LØNNET_FRA_NORSK_ARBEIDSGIVER,
  Hjelpetekster.NORSK_STATSBORGER,
];

const hjelpeteksterAuArt9_2 = [Hjelpetekster.UTSENDT_FOR_ARBEID, Hjelpetekster.ANSATT_I_DEN_NORSKE_STAT];

const hjelpeteksterAuArt9_3 = [
  Hjelpetekster.MEDLEM_I_FOLKETRYGDEN,
  Hjelpetekster.LØNNET_FRA_NORSK_ARBEIDSGIVER,
  Hjelpetekster.MAX_TRE_ÅR,
];

export {
  hjelpeteksterUkArt61,
  hjelpeteksterUkArt65,
  hjelpeteksterUkArt73,
  hjelpeteksterUkArt82,
  hjelpeteksterUsArt52,
  hjelpeteksterUsArt54,
  hjelpeteksterUsArt55,
  hjelpeteksterUsArt56,
  hjelpeteksterCaArt62,
  hjelpeteksterCaArt7,
  hjelpeteksterCaArt9,
  hjelpeteksterCaArt10,
  hjelpeteksterAuArt9_2,
  hjelpeteksterAuArt9_3,
};
