import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFiltrerteTekstblokker } from "./tekstblokker";
import { TekstblokkOversikt } from "../modules/tekstblokker";

const blokk = (
  id: number,
  tittel: string,
  tags: string[],
  sakstyper: string[] = [],
  behandlingstemaer: string[] = [],
): TekstblokkOversikt => ({
  id,
  tittel,
  innhold: "",
  type: "TEKSTBLOKK",
  tags,
  sakstyper,
  behandlingstemaer,
  endretDato: "2026-01-01T00:00:00Z",
  endretAv: "Z123456",
  endretAvNavn: null,
});

const alle = blokk(1, "Gjelder alle", ["felles"]);
const euEos = blokk(2, "Kun EU/EØS", ["felles", "eueos"], ["EU_EOS"]);
const utsendt = blokk(3, "Kun utsendt arbeidstaker", ["felles"], [], ["UTSENDT_ARBEIDSTAKER"]);

const blokker = [alle, euEos, utsendt];

const filtrer = (soek: string, valgteTags: string[], sakstype?: string, behandlingstema?: string) =>
  renderHook(() => useFiltrerteTekstblokker(blokker, soek, valgteTags, sakstype, behandlingstema)).result.current;

const titler = (synlige: TekstblokkOversikt[]) => synlige.map((b) => b.tittel);

describe("useFiltrerteTekstblokker med kontekst", () => {
  it("filtrerer ikke uten kontekst (uendret oppførsel for admin)", () => {
    const { synlige } = filtrer("", []);

    expect(titler(synlige)).toEqual(["Gjelder alle", "Kun EU/EØS", "Kun utsendt arbeidstaker"]);
  });

  it("skjuler blokker som er avgrenset til en annen sakstype", () => {
    const { synlige } = filtrer("", [], "FTRL", "");

    expect(titler(synlige)).toEqual(["Gjelder alle", "Kun utsendt arbeidstaker"]);
  });

  it("skjuler blokker som er avgrenset til et annet behandlingstema", () => {
    const { synlige } = filtrer("", [], "EU_EOS", "PENSJONIST");

    expect(titler(synlige)).toEqual(["Gjelder alle", "Kun EU/EØS"]);
  });

  it("tar med blokker som matcher hele konteksten", () => {
    const { synlige } = filtrer("", [], "EU_EOS", "UTSENDT_ARBEIDSTAKER");

    expect(titler(synlige)).toEqual(["Gjelder alle", "Kun EU/EØS", "Kun utsendt arbeidstaker"]);
  });

  it("tag-tellingen speiler konteksten", () => {
    // Uten kontekstfiltrering først ville "felles" telt 3 og "eueos" dukket opp i filteret.
    const { tagAntall } = filtrer("", [], "FTRL", "PENSJONIST");

    expect(tagAntall).toEqual([["felles", 1]]);
  });

  it("kombinerer kontekst med søk og tags", () => {
    const { synlige } = filtrer("kun", ["felles"], "EU_EOS", "PENSJONIST");

    expect(titler(synlige)).toEqual(["Kun EU/EØS"]);
  });
});
