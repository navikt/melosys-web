import { describe, it, expect } from "vitest";

import LinkGroupsBuilder from "./linkgroupsBuilder";

describe("LinkGroupsBuilder", () => {
  it("bygger tom liste uten add-kall", () => {
    const result = new LinkGroupsBuilder().build();
    expect(result).toEqual([]);
  });

  it("legger til FRA REGISTER gruppe", () => {
    const links = [{ label: "Person", path: "/person" }];
    const result = new LinkGroupsBuilder().addFraRegister(links as any).build();
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("FRA REGISTER");
    expect(result[0].links).toBe(links);
  });

  it("legger til FRA REGISTER OG BRUKER gruppe", () => {
    const links = [{ label: "Periode", path: "/periode" }];
    const result = new LinkGroupsBuilder().addFraRegisterOgBruker(links as any).build();
    expect(result[0].label).toBe("FRA REGISTER OG BRUKER");
  });

  it("legger til FRA BRUKER gruppe", () => {
    const links = [{ label: "Arbeid", path: "/arbeid" }];
    const result = new LinkGroupsBuilder().addFraBruker(links as any).build();
    expect(result[0].label).toBe("FRA BRUKER");
  });

  it("legger til gruppe uten label", () => {
    const links = [{ label: "Annet", path: "/annet" }];
    const result = new LinkGroupsBuilder().addUtenLabel(links as any).build();
    expect(result[0].label).toBeUndefined();
    expect(result[0].links).toBe(links);
  });

  it("støtter chaining av flere grupper", () => {
    const result = new LinkGroupsBuilder()
      .addFraRegister([{ label: "A", path: "/a" }] as any)
      .addFraBruker([{ label: "B", path: "/b" }] as any)
      .addUtenLabel([{ label: "C", path: "/c" }] as any)
      .build();
    expect(result).toHaveLength(3);
    expect(result[0].label).toBe("FRA REGISTER");
    expect(result[1].label).toBe("FRA BRUKER");
    expect(result[2].label).toBeUndefined();
  });
});
