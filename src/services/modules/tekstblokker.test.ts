import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  erTagValgt,
  gjelderKontekst,
  harAlleTags,
  harStatus,
  hent,
  hentAlle,
  hentHistorikk,
  leggTilTag,
  matcherSoek,
  publiser,
  tellTags,
  tellTagsMedValgte,
  TekstblokkOversikt,
  toggleITagliste,
} from "./tekstblokker";
import { tekstblokkOversikt } from "./tekstblokkTestdata";
import { getAsJson, postAsJson } from "../utils";

vi.mock("../utils", () => ({
  getAsJson: vi.fn(),
  postAsJson: vi.fn(),
  putAsJson: vi.fn(),
  deleteAsJson: vi.fn(),
}));

type Kontekstavgrensning = Pick<TekstblokkOversikt, "sakstyper" | "behandlingstemaer">;

const blokk = (
  tittel: string,
  tags: string[],
  innhold = "",
  avgrensning: Partial<Kontekstavgrensning> = {},
): TekstblokkOversikt => tekstblokkOversikt({ tittel, innhold, tags, ...avgrensning });

describe("normalisering på api-grensen", () => {
  beforeEach(() => vi.mocked(getAsJson).mockReset());

  const utenAvgrensning = {
    id: 1,
    tittel: "Om utsending",
    innhold: "<p>Tekst</p>",
    type: "TEKSTBLOKK",
    tags: ["usa"],
  };

  it("hentAlle gir tomme lister når api-et utelater avgrensningsfeltene", async () => {
    vi.mocked(getAsJson).mockResolvedValue([utenAvgrensning]);

    const blokker = await hentAlle("TEKSTBLOKK");

    expect(blokker[0]).toMatchObject({ tittel: "Om utsending", sakstyper: [], behandlingstemaer: [] });
  });

  it("hentAlle beholder avgrensningen når api-et sender den", async () => {
    vi.mocked(getAsJson).mockResolvedValue([{ ...utenAvgrensning, sakstyper: ["EU_EOS"], behandlingstemaer: [] }]);

    const blokker = await hentAlle();

    expect(blokker[0]).toMatchObject({ sakstyper: ["EU_EOS"], behandlingstemaer: [] });
  });

  it("hentAlle ber kun om utkast når admin-flaten eksplisitt spør", async () => {
    vi.mocked(getAsJson).mockResolvedValue([]);

    await hentAlle("TEKSTBLOKK", true);
    expect(vi.mocked(getAsJson).mock.calls[0][0]).toContain("inkluderUtkast=true");

    await hentAlle("TEKSTBLOKK");
    expect(vi.mocked(getAsJson).mock.calls[1][0]).not.toContain("inkluderUtkast");
  });

  it("hent gir tomme lister når api-et utelater avgrensningsfeltene", async () => {
    vi.mocked(getAsJson).mockResolvedValue(utenAvgrensning);

    const blokk = await hent(1);

    expect(blokk).toMatchObject({ tittel: "Om utsending", sakstyper: [], behandlingstemaer: [] });
  });

  it("regner en blokk uten status som publisert", async () => {
    vi.mocked(getAsJson).mockResolvedValue([utenAvgrensning]);

    const blokker = await hentAlle();

    expect(blokker[0].status).toBe("PUBLISERT");
  });

  it("beholder statusen api-et sender", async () => {
    vi.mocked(getAsJson).mockResolvedValue({ ...utenAvgrensning, status: "UTKAST" });

    const blokk = await hent(1);

    expect(blokk.status).toBe("UTKAST");
  });
});

describe("publiser og hentHistorikk", () => {
  beforeEach(() => {
    vi.mocked(getAsJson).mockReset();
    vi.mocked(postAsJson).mockReset();
  });

  it("publiser kaller publiser-endepunktet og normaliserer svaret", async () => {
    vi.mocked(postAsJson).mockResolvedValue({ id: 7, tittel: "Om utsending", status: "PUBLISERT" });

    const blokk = await publiser(7);

    expect(postAsJson).toHaveBeenCalledWith(expect.stringContaining("brev/tekstblokker/7/publiser"));
    expect(blokk).toMatchObject({ status: "PUBLISERT", sakstyper: [], behandlingstemaer: [] });
  });

  it("hentHistorikk henter versjonene for blokken", async () => {
    vi.mocked(getAsJson).mockResolvedValue([{ versjon: 1, endringstype: "OPPRETTET" }]);

    const versjoner = await hentHistorikk(7);

    expect(getAsJson).toHaveBeenCalledWith(expect.stringContaining("brev/tekstblokker/7/historikk"));
    expect(versjoner).toHaveLength(1);
  });

  it("hentHistorikk fyller ut manglende felter på versjoner api-et har levert data om", async () => {
    vi.mocked(getAsJson).mockResolvedValue([{ versjon: 1, endringstype: "OPPRETTET", sakstyper: ["EU_EOS"] }]);

    const [versjon] = await hentHistorikk(7);

    expect(versjon).toMatchObject({ sakstyper: ["EU_EOS"], behandlingstemaer: [], tags: [], status: "PUBLISERT" });
  });

  it("hentHistorikk lar feltene stå udefinert for versjoner fra et api uten dem", async () => {
    vi.mocked(getAsJson).mockResolvedValue([{ versjon: 1, endringstype: "OPPRETTET" }]);

    const [versjon] = await hentHistorikk(7);

    expect(versjon.sakstyper).toBeUndefined();
    expect(versjon.status).toBeUndefined();
  });
});

describe("harStatus", () => {
  const utkast = { status: "UTKAST" } as const;
  const publisert = { status: "PUBLISERT" } as const;

  it("«Alle» slipper gjennom begge statusene", () => {
    expect(harStatus(utkast, "ALLE")).toBe(true);
    expect(harStatus(publisert, "ALLE")).toBe(true);
  });

  it("filtrerer på den valgte statusen", () => {
    expect(harStatus(utkast, "UTKAST")).toBe(true);
    expect(harStatus(publisert, "UTKAST")).toBe(false);
    expect(harStatus(publisert, "PUBLISERT")).toBe(true);
    expect(harStatus(utkast, "PUBLISERT")).toBe(false);
  });
});

describe("matcherSoek", () => {
  const usaAvslag = blokk("USA – Utsendt arbeidstaker", ["usa", "avslag", "utsending"]);

  it("matcher tom søkestreng", () => {
    expect(matcherSoek(usaAvslag, "")).toBe(true);
    expect(matcherSoek(usaAvslag, "   ")).toBe(true);
  });

  it("matcher på tittel", () => {
    expect(matcherSoek(usaAvslag, "utsendt")).toBe(true);
  });

  it("matcher på tag", () => {
    expect(matcherSoek(usaAvslag, "avslag")).toBe(true);
  });

  it("matcher flere ord på tvers av tittel og tags (AND)", () => {
    expect(matcherSoek(usaAvslag, "USA avslag")).toBe(true);
    expect(matcherSoek(usaAvslag, "usa, avslag")).toBe(true);
    expect(matcherSoek(usaAvslag, "utsendt usa")).toBe(true);
  });

  it("krever at alle ord matcher", () => {
    expect(matcherSoek(usaAvslag, "USA innvilgelse")).toBe(false);
    expect(matcherSoek(usaAvslag, "canada")).toBe(false);
  });

  it("søker ikke i innhold (kun tittel og tags)", () => {
    const medInnhold = blokk(
      "Tittel",
      ["tag"],
      "<p>Du er omfattet av norsk <strong>trygdelovgivning</strong> i territorialfarvann.</p>",
    );
    expect(matcherSoek(medInnhold, "territorialfarvann")).toBe(false);
    expect(matcherSoek(medInnhold, "trygdelovgivning")).toBe(false);
    expect(matcherSoek(medInnhold, "tittel")).toBe(true);
    expect(matcherSoek(medInnhold, "tag")).toBe(true);
  });
});

describe("tellTags", () => {
  it("grupperer tags case-insensitivt og beholder første skrivemåte", () => {
    const blokker = [blokk("A", ["USA-avtale"]), blokk("B", ["usa-avtale"]), blokk("C", ["Norge"])];
    const resultat = tellTags(blokker);

    expect(resultat).toContainEqual(["USA-avtale", 2]);
    expect(resultat).toContainEqual(["Norge", 1]);
    expect(resultat).toHaveLength(2);
  });
});

describe("tellTagsMedValgte", () => {
  const britiskSkip = blokk("Storbritannia – Arbeid på skip", ["storbritannia", "skip"]);

  it("teller tags i utvalget når ingenting er valgt", () => {
    expect(tellTagsMedValgte([britiskSkip], [])).toContainEqual(["skip", 1]);
  });

  it("tar med valgt tag som finnes i utvalget", () => {
    const resultat = tellTagsMedValgte([britiskSkip], ["storbritannia"]);

    expect(resultat).toContainEqual(["storbritannia", 1]);
    expect(resultat).toHaveLength(2);
  });

  it("tar med valgt tag som ikke gir treff, med antall 0", () => {
    // Uten dette ville taggen forsvinne fra filteret og ikke kunne fjernes igjen.
    const resultat = tellTagsMedValgte([], ["storbritannia", "utsending"]);

    expect(resultat).toEqual([
      ["storbritannia", 0],
      ["utsending", 0],
    ]);
  });

  it("viser valgt tag med brukerens skrivemåte, ikke utvalgets", () => {
    // Ellers slutter chip/nedtrekk å matche det som faktisk er valgt.
    const medStorForbokstav = blokk("Tittel", ["Storbritannia"]);
    const resultat = tellTagsMedValgte([medStorForbokstav], ["storbritannia"]);

    expect(resultat).toEqual([["storbritannia", 1]]);
  });
});

describe("harAlleTags", () => {
  const britiskSkip = blokk("Storbritannia (1990) – Arbeid på skip", ["storbritannia", "skip", "innvilgelse"]);
  const australskSkip = blokk("Australia – Arbeid på skip", ["australia", "skip", "innvilgelse"]);

  it("slipper alt gjennom når ingen tags er valgt", () => {
    expect(harAlleTags(britiskSkip, [])).toBe(true);
  });

  it("krever alle valgte tags, ikke bare én", () => {
    expect(harAlleTags(britiskSkip, ["storbritannia", "skip"])).toBe(true);
    expect(harAlleTags(australskSkip, ["storbritannia", "skip"])).toBe(false);
  });

  it("matcher enkelttag", () => {
    expect(harAlleTags(australskSkip, ["skip"])).toBe(true);
    expect(harAlleTags(australskSkip, ["storbritannia"])).toBe(false);
  });

  it("matcher case-insensitivt begge veier", () => {
    const medStorForbokstav = blokk("Tittel", ["USA-avtale", "Skip"]);
    expect(harAlleTags(medStorForbokstav, ["usa-avtale", "skip"])).toBe(true);
    expect(harAlleTags(britiskSkip, ["Storbritannia", "SKIP"])).toBe(true);
  });

  it("gir ingen treff når blokken mangler en av tagene", () => {
    expect(harAlleTags(britiskSkip, ["storbritannia", "utsending"])).toBe(false);
  });

  it("blokk uten tags matcher ingen valgte tags", () => {
    expect(harAlleTags(blokk("Uten tags", []), ["skip"])).toBe(false);
  });
});

describe("gjelderKontekst", () => {
  const uavgrenset: Kontekstavgrensning = { sakstyper: [], behandlingstemaer: [] };
  const kunEuEos: Kontekstavgrensning = { sakstyper: ["EU_EOS"], behandlingstemaer: [] };
  const kunUtsendt: Kontekstavgrensning = { sakstyper: [], behandlingstemaer: ["UTSENDT_ARBEIDSTAKER"] };
  const begge: Kontekstavgrensning = { sakstyper: ["EU_EOS"], behandlingstemaer: ["UTSENDT_ARBEIDSTAKER"] };

  it("uavgrenset blokk gjelder alltid", () => {
    expect(gjelderKontekst(uavgrenset, "EU_EOS", "UTSENDT_ARBEIDSTAKER")).toBe(true);
    expect(gjelderKontekst(uavgrenset, "FTRL", "PENSJONIST")).toBe(true);
    expect(gjelderKontekst(uavgrenset)).toBe(true);
  });

  it("tom kontekst filtrerer ingenting bort (admin uten sak)", () => {
    expect(gjelderKontekst(begge)).toBe(true);
    expect(gjelderKontekst(begge, "", "")).toBe(true);
  });

  it("avgrensning på sakstype treffer kun sin sakstype", () => {
    expect(gjelderKontekst(kunEuEos, "EU_EOS", "PENSJONIST")).toBe(true);
    expect(gjelderKontekst(kunEuEos, "FTRL", "PENSJONIST")).toBe(false);
  });

  it("avgrensning på behandlingstema treffer kun sitt behandlingstema", () => {
    expect(gjelderKontekst(kunUtsendt, "FTRL", "UTSENDT_ARBEIDSTAKER")).toBe(true);
    expect(gjelderKontekst(kunUtsendt, "FTRL", "PENSJONIST")).toBe(false);
  });

  it("begge avgrensningene må passere samtidig", () => {
    expect(gjelderKontekst(begge, "EU_EOS", "UTSENDT_ARBEIDSTAKER")).toBe(true);
    expect(gjelderKontekst(begge, "EU_EOS", "PENSJONIST")).toBe(false);
    expect(gjelderKontekst(begge, "FTRL", "UTSENDT_ARBEIDSTAKER")).toBe(false);
    expect(gjelderKontekst(begge, "FTRL", "PENSJONIST")).toBe(false);
  });

  it("en avgrensning ignoreres når den andre delen av konteksten mangler", () => {
    expect(gjelderKontekst(begge, "EU_EOS")).toBe(true);
    expect(gjelderKontekst(begge, "FTRL")).toBe(false);
    expect(gjelderKontekst(begge, "", "UTSENDT_ARBEIDSTAKER")).toBe(true);
    expect(gjelderKontekst(begge, "", "PENSJONIST")).toBe(false);
  });

  it("flere verdier i avgrensningen virker som ELLER", () => {
    const flere: Kontekstavgrensning = { sakstyper: ["EU_EOS", "TRYGDEAVTALE"], behandlingstemaer: [] };
    expect(gjelderKontekst(flere, "EU_EOS")).toBe(true);
    expect(gjelderKontekst(flere, "TRYGDEAVTALE")).toBe(true);
    expect(gjelderKontekst(flere, "FTRL")).toBe(false);
  });
});

describe("toggleITagliste og erTagValgt", () => {
  it("legger til tag som ikke er valgt", () => {
    expect(toggleITagliste(["skip"], "storbritannia")).toEqual(["skip", "storbritannia"]);
  });

  it("fjerner tag uavhengig av bokstavstørrelse", () => {
    // Tags bevarer skrivemåte, så samme tag kan hete "Skip" i én blokk og "skip" i en annen.
    expect(toggleITagliste(["Skip", "norge"], "skip")).toEqual(["norge"]);
  });

  it("legger ikke til duplikat med annen bokstavstørrelse", () => {
    expect(toggleITagliste(["Skip"], "skip")).toEqual([]);
  });

  it("erTagValgt matcher case-insensitivt", () => {
    expect(erTagValgt(["Skip"], "skip")).toBe(true);
    expect(erTagValgt(["Skip"], "SKIP")).toBe(true);
    expect(erTagValgt(["Skip"], "norge")).toBe(false);
  });
});

describe("leggTilTag", () => {
  it("legger til tag og bevarer bokstavstørrelse og mellomrom", () => {
    expect(leggTilTag([], "USA-avtale")).toEqual(["USA-avtale"]);
    expect(leggTilTag([], "ny vurdering")).toEqual(["ny vurdering"]);
  });

  it("trimmer ytterkanter og slår sammen gjentatt blanktegn", () => {
    expect(leggTilTag([], "  ny    vurdering  ")).toEqual(["ny vurdering"]);
  });

  it("ignorerer tomt utkast", () => {
    expect(leggTilTag(["usa"], "")).toEqual(["usa"]);
    expect(leggTilTag(["usa"], "   ")).toEqual(["usa"]);
  });

  it("ignorerer duplikat uavhengig av bokstavstørrelse", () => {
    expect(leggTilTag(["USA-avtale"], "usa-avtale")).toEqual(["USA-avtale"]);
  });

  it("endrer ikke den opprinnelige lista", () => {
    const original = ["usa"];
    leggTilTag(original, "avslag");
    expect(original).toEqual(["usa"]);
  });
});
