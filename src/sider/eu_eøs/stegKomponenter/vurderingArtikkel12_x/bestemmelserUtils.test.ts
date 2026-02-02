import { describe, it, expect } from "vitest";

import {
  VedtakValg,
  initializeVedtakValg,
  finnFeltNavn,
  hentRelevantUtsendelseArtikkel12,
  hentRelevantUtsendelseArtikkel14,
  hentRelevantUtsendelseArtikkel16,
  finnTilleggsbestemmelse,
  begrunnelseKoderForSokkelStorbritannia,
  alleRelevanteFeltNavn,
} from "./bestemmelserUtils";

describe("VedtakValg enum", () => {
  it("har tre verdier", () => {
    expect(VedtakValg.JA_INNVILGE).toBe("JA_INNVILGE");
    expect(VedtakValg.NEI_ANMODNING_UNNTAK).toBe("NEI_ANMODNING_UNNTAK");
    expect(VedtakValg.NEI_AVSLAG).toBe("NEI_AVSLAG");
  });
});

describe("initializeVedtakValg", () => {
  it("returnerer JA_INNVILGE når utsendingsvilkår er oppfylt", () => {
    expect(initializeVedtakValg({ oppfylt: true }, {})).toBe(VedtakValg.JA_INNVILGE);
  });

  it("returnerer NEI_ANMODNING_UNNTAK når utsending ikke oppfylt men unntak oppfylt", () => {
    expect(initializeVedtakValg({ oppfylt: false }, { oppfylt: true })).toBe(VedtakValg.NEI_ANMODNING_UNNTAK);
  });

  it("returnerer NEI_AVSLAG når begge ikke oppfylt", () => {
    expect(initializeVedtakValg({ oppfylt: false }, { oppfylt: false })).toBe(VedtakValg.NEI_AVSLAG);
  });

  it("returnerer undefined når ingen er satt", () => {
    expect(initializeVedtakValg({}, {})).toBeUndefined();
  });
});

describe("finnFeltNavn", () => {
  it("mapper art12_1 kode til feltnavn", () => {
    expect(finnFeltNavn("FO_883_2004_ART12_1")).toBe("art12_1");
  });

  it("mapper art12_2 kode til feltnavn", () => {
    expect(finnFeltNavn("FO_883_2004_ART12_2")).toBe("art12_2");
  });

  it("returnerer koden selv for ukjent vilkår", () => {
    expect(finnFeltNavn("ANNEN_KODE")).toBe("ANNEN_KODE");
  });

  it("returnerer tom streng for undefined", () => {
    expect(finnFeltNavn(undefined)).toBe("");
  });
});

describe("hentRelevantUtsendelseArtikkel", () => {
  it("art12 returnerer art12_1 for arbeidstaker", () => {
    expect(hentRelevantUtsendelseArtikkel12(true)).toBe("FO_883_2004_ART12_1");
  });

  it("art12 returnerer art12_2 for næringsdrivende", () => {
    expect(hentRelevantUtsendelseArtikkel12(false)).toBe("FO_883_2004_ART12_2");
  });

  it("art14 returnerer art14_1 for arbeidstaker", () => {
    expect(hentRelevantUtsendelseArtikkel14(true)).toBe("KONV_EFTA_STORBRITANNIA_ART14_1");
  });

  it("art14 returnerer art14_2 for næringsdrivende", () => {
    expect(hentRelevantUtsendelseArtikkel14(false)).toBe("KONV_EFTA_STORBRITANNIA_ART14_2");
  });

  it("art16 returnerer art16_1 for arbeidstaker", () => {
    expect(hentRelevantUtsendelseArtikkel16(true)).toBe("KONV_EFTA_STORBRITANNIA_ART16_1");
  });

  it("art16 returnerer art16_3 for næringsdrivende", () => {
    expect(hentRelevantUtsendelseArtikkel16(false)).toBe("KONV_EFTA_STORBRITANNIA_ART16_3");
  });
});

describe("finnTilleggsbestemmelse", () => {
  it("returnerer art11_5 for flyende personell med art12_1", () => {
    expect(finnTilleggsbestemmelse("FO_883_2004_ART12_1", "YRKESAKTIV_FLYVENDE", undefined)).toBe(
      "FO_883_2004_ART11_5",
    );
  });

  it("returnerer art13_5 for flyende personell med art14_1", () => {
    expect(finnTilleggsbestemmelse("KONV_EFTA_STORBRITANNIA_ART14_1", "YRKESAKTIV_FLYVENDE", undefined)).toBe(
      "KONV_EFTA_STORBRITANNIA_ART13_5",
    );
  });

  it("returnerer art11_4_1 for sokkel/skip med skip_ett_land og art12_1", () => {
    expect(finnTilleggsbestemmelse("FO_883_2004_ART12_1", "SOKKEL_ELLER_SKIP", "SKIP_ETT_LAND")).toBe(
      "FO_883_2004_ART11_4_1",
    );
  });

  it("returnerer art13_4_1 for sokkel/skip med skip_ett_land og art14_2", () => {
    expect(finnTilleggsbestemmelse("KONV_EFTA_STORBRITANNIA_ART14_2", "SOKKEL_ELLER_SKIP", "SKIP_ETT_LAND")).toBe(
      "KONV_EFTA_STORBRITANNIA_ART13_4_1",
    );
  });

  it("returnerer undefined for ordinær yrkesgruppe", () => {
    expect(finnTilleggsbestemmelse("FO_883_2004_ART12_1", "ORDINAER", undefined)).toBeUndefined();
  });

  it("returnerer undefined for ukjent lovvalgsbestemmelse med flyende personell", () => {
    expect(finnTilleggsbestemmelse("UKJENT", "YRKESAKTIV_FLYVENDE", undefined)).toBeUndefined();
  });
});

describe("konstanter", () => {
  it("begrunnelseKoderForSokkelStorbritannia har 6 koder", () => {
    expect(begrunnelseKoderForSokkelStorbritannia).toHaveLength(6);
  });

  it("alleRelevanteFeltNavn har 9 feltnavn", () => {
    expect(alleRelevanteFeltNavn).toHaveLength(9);
  });
});
