import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFiltrerteTekstblokker } from "./tekstblokker";
import { Sakskontekst, Statusfilter, TekstblokkOversikt, TekstblokkStatus } from "../modules/tekstblokker";
import { tekstblokkOversikt } from "../modules/tekstblokkTestdata";

const blokk = (
  id: number,
  tittel: string,
  tags: string[],
  avgrensning: Partial<Pick<TekstblokkOversikt, "sakstyper" | "sakstemaer" | "behandlingstemaer">> = {},
  status: TekstblokkStatus = "PUBLISERT",
): TekstblokkOversikt =>
  tekstblokkOversikt({
    id,
    tittel,
    innhold: "",
    tags,
    sakstyper: avgrensning.sakstyper ?? [],
    sakstemaer: avgrensning.sakstemaer ?? [],
    behandlingstemaer: avgrensning.behandlingstemaer ?? [],
    status,
  });

const alle = blokk(1, "Gjelder alle", ["felles"]);
const euEos = blokk(2, "Kun EU/EØS", ["felles", "eueos"], { sakstyper: ["EU_EOS"] });
const lovvalg = blokk(3, "Kun lovvalg", ["felles"], { sakstemaer: ["MEDLEMSKAP_LOVVALG"] });
const utsendt = blokk(4, "Kun utsendt arbeidstaker", ["felles"], { behandlingstemaer: ["UTSENDT_ARBEIDSTAKER"] });

const blokker = [alle, euEos, lovvalg, utsendt];

const filtrer = (soek: string, valgteTags: string[], kontekst: Sakskontekst = {}) =>
  renderHook(() => useFiltrerteTekstblokker(blokker, soek, valgteTags, kontekst)).result.current;

const titler = (synlige: TekstblokkOversikt[]) => synlige.map((b) => b.tittel);

describe("useFiltrerteTekstblokker med kontekst", () => {
  it("filtrerer ikke uten kontekst (uendret oppførsel for admin)", () => {
    const { synlige } = filtrer("", []);

    expect(titler(synlige)).toEqual(["Gjelder alle", "Kun EU/EØS", "Kun lovvalg", "Kun utsendt arbeidstaker"]);
  });

  it("skjuler blokker som er avgrenset til en annen sakstype", () => {
    const { synlige } = filtrer("", [], { sakstype: "FTRL" });

    expect(titler(synlige)).toEqual(["Gjelder alle", "Kun lovvalg", "Kun utsendt arbeidstaker"]);
  });

  it("skjuler blokker som er avgrenset til et annet sakstema", () => {
    const { synlige } = filtrer("", [], { sakstema: "TRYGDEAVGIFT" });

    expect(titler(synlige)).toEqual(["Gjelder alle", "Kun EU/EØS", "Kun utsendt arbeidstaker"]);
  });

  it("skjuler blokker som er avgrenset til et annet behandlingstema", () => {
    const { synlige } = filtrer("", [], { sakstype: "EU_EOS", behandlingstema: "PENSJONIST" });

    expect(titler(synlige)).toEqual(["Gjelder alle", "Kun EU/EØS", "Kun lovvalg"]);
  });

  it("tar med blokker som matcher hele konteksten", () => {
    const { synlige } = filtrer("", [], {
      sakstype: "EU_EOS",
      sakstema: "MEDLEMSKAP_LOVVALG",
      behandlingstema: "UTSENDT_ARBEIDSTAKER",
    });

    expect(titler(synlige)).toEqual(["Gjelder alle", "Kun EU/EØS", "Kun lovvalg", "Kun utsendt arbeidstaker"]);
  });

  it("alle tre delene av konteksten avgrenser samtidig", () => {
    const { synlige } = filtrer("", [], {
      sakstype: "FTRL",
      sakstema: "TRYGDEAVGIFT",
      behandlingstema: "PENSJONIST",
    });

    expect(titler(synlige)).toEqual(["Gjelder alle"]);
  });

  it("tag-tellingen speiler konteksten", () => {
    // Uten kontekstfiltrering først ville "felles" telt 4 og "eueos" dukket opp i filteret.
    const { tagAntall } = filtrer("", [], {
      sakstype: "FTRL",
      sakstema: "TRYGDEAVGIFT",
      behandlingstema: "PENSJONIST",
    });

    expect(tagAntall).toEqual([["felles", 1]]);
  });

  it("kombinerer kontekst med søk og tags", () => {
    const { synlige } = filtrer("kun", ["felles"], {
      sakstype: "EU_EOS",
      sakstema: "MEDLEMSKAP_LOVVALG",
      behandlingstema: "PENSJONIST",
    });

    expect(titler(synlige)).toEqual(["Kun EU/EØS", "Kun lovvalg"]);
  });
});

describe("useFiltrerteTekstblokker – antall uten kontekst", () => {
  it("teller treffene søket og tagene gir når kontekstavgrensningen ses bort fra", () => {
    const { synlige, antallUtenKontekst } = filtrer("eu/eøs", [], {
      sakstype: "FTRL",
      sakstema: "TRYGDEAVGIFT",
      behandlingstema: "PENSJONIST",
    });

    expect(titler(synlige)).toEqual([]);
    expect(antallUtenKontekst).toBe(1);
  });

  it("teller ingenting når det er søket – ikke konteksten – som tømmer lista", () => {
    expect(filtrer("finnesikke", [], { sakstype: "FTRL", behandlingstema: "PENSJONIST" }).antallUtenKontekst).toBe(0);
  });

  it("holder statusfilteret utenfor: utkast teller aldri som skjult av konteksten", () => {
    const utkast = blokk(9, "Uferdig", [], {}, "UTKAST");
    const { antallUtenKontekst } = renderHook(() =>
      useFiltrerteTekstblokker(
        [utkast],
        "",
        [],
        { sakstype: "FTRL", sakstema: "TRYGDEAVGIFT", behandlingstema: "PENSJONIST" },
        "PUBLISERT",
      ),
    ).result.current;

    expect(antallUtenKontekst).toBe(0);
  });
});

describe("useFiltrerteTekstblokker med statusfilter", () => {
  const publisert = blokk(1, "Publisert blokk", ["felles"]);
  const utkast = blokk(2, "Utkast blokk", ["felles", "nytt"], {}, "UTKAST");

  const filtrerStatus = (statusfilter: Statusfilter) =>
    renderHook(() => useFiltrerteTekstblokker([publisert, utkast], "", [], {}, statusfilter)).result.current;

  it("viser alt som standard", () => {
    expect(titler(filtrerStatus("ALLE").synlige)).toEqual(["Publisert blokk", "Utkast blokk"]);
  });

  it("viser kun publiserte", () => {
    expect(titler(filtrerStatus("PUBLISERT").synlige)).toEqual(["Publisert blokk"]);
  });

  it("viser kun utkast", () => {
    expect(titler(filtrerStatus("UTKAST").synlige)).toEqual(["Utkast blokk"]);
  });

  it("tag-tellingen speiler statusfilteret", () => {
    expect(filtrerStatus("UTKAST").tagAntall).toEqual([
      ["felles", 1],
      ["nytt", 1],
    ]);
  });
});
