import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import Kontekstavgrensning from "./kontekstavgrensning";
import { SakstypeNode } from "../../../services/modules/lovligekombinasjoner/kombinasjonstre";

const mocks = vi.hoisted(() => ({
  kombinasjonstre: vi.fn(() => ({ data: undefined, isError: false }) as { data?: unknown; isError: boolean }),
}));

vi.mock("../../../services/api/kombinasjonstre", () => ({
  useKombinasjonstre: () => mocks.kombinasjonstre(),
}));

const kode = (k: string, term: string) => ({ kode: k, term });

// Et lite tre med ekte koder, så visningsnavnene under kommer fra kodeverket.
const tre: SakstypeNode[] = [
  {
    sakstype: kode("EU_EOS", "EU/EØS-land"),
    sakstemaer: [
      {
        sakstema: kode("MEDLEMSKAP_LOVVALG", "Medlemskap og lovvalg"),
        behandlingstemaer: [kode("UTSENDT_ARBEIDSTAKER", "Utsendt arbeidstaker")],
      },
    ],
  },
  {
    sakstype: kode("FTRL", "Utenfor avtaleland"),
    sakstemaer: [
      {
        sakstema: kode("TRYGDEAVGIFT", "Trygdeavgift"),
        behandlingstemaer: [kode("ARBEID_KUN_NORGE", "Arbeid kun i Norge")],
      },
    ],
  },
];

// Ekte state, ikke spioner: kaskaden rydder i valgene under, og det ryddede resultatet
// må faktisk tilbake i komponenten for at nedtrekkene skal oppdatere seg.
function Vert({
  start = {},
}: {
  start?: { sakstyper?: string[]; sakstemaer?: string[]; behandlingstemaer?: string[] };
}) {
  const [sakstyper, setSakstyper] = useState<string[]>(start.sakstyper ?? []);
  const [sakstemaer, setSakstemaer] = useState<string[]>(start.sakstemaer ?? []);
  const [behandlingstemaer, setBehandlingstemaer] = useState<string[]>(start.behandlingstemaer ?? []);
  return (
    <>
      <Kontekstavgrensning
        sakstyper={sakstyper}
        setSakstyper={setSakstyper}
        sakstemaer={sakstemaer}
        setSakstemaer={setSakstemaer}
        behandlingstemaer={behandlingstemaer}
        setBehandlingstemaer={setBehandlingstemaer}
      />
      <output data-testid="valg">{JSON.stringify({ sakstyper, sakstemaer, behandlingstemaer })}</output>
    </>
  );
}

const aapne = async (feltnavn: string) => {
  await userEvent.click(screen.getByRole("combobox", { name: feltnavn }));
};

// Alle tre nedtrekkene ligger i samme DOM samtidig, så opsjonene må hentes fra listen
// dette feltet eier – ikke fra alle listbokser på siden.
const opsjoner = (feltnavn: string) => {
  const felt = screen.getByRole("combobox", { name: feltnavn });
  const liste = document.getElementById(felt.getAttribute("aria-controls") ?? "");
  if (!liste) throw new Error(`Fant ingen liste for "${feltnavn}"`);
  return within(liste)
    .getAllByRole("option")
    .map((o) => o.textContent);
};

const velg = async (feltnavn: string, opsjon: string) => {
  await aapne(feltnavn);
  await userEvent.click(screen.getByRole("option", { name: opsjon }));
};

const valg = () => JSON.parse(screen.getByTestId("valg").textContent ?? "{}");

describe("Kontekstavgrensning – kaskade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kombinasjonstre.mockReturnValue({ data: tre, isError: false });
  });

  it("viser alle sakstemaer og behandlingstemaer i treet når ingenting er valgt", async () => {
    render(<Vert />);

    await aapne("Gjelder sakstema");
    expect(opsjoner("Gjelder sakstema")).toEqual(["Medlemskap og lovvalg", "Trygdeavgift"]);
  });

  it("begrenser sakstema til det som er lovlig for valgt sakstype", async () => {
    render(<Vert />);

    await velg("Gjelder sakstype", "EU/EØS-land");
    await aapne("Gjelder sakstema");

    expect(opsjoner("Gjelder sakstema")).toEqual(["Medlemskap og lovvalg"]);
  });

  it("begrenser behandlingstema til det som er lovlig for valgt sakstype og sakstema", async () => {
    render(<Vert />);

    await velg("Gjelder sakstype", "Utenfor avtaleland");
    await velg("Gjelder sakstema", "Trygdeavgift");
    await aapne("Gjelder behandlingstema");

    expect(opsjoner("Gjelder behandlingstema")).toEqual(["Arbeid kun i Norge"]);
  });

  // Uten opprydding ville avgrensningen blitt stående på en umulig kombinasjon, usynlig
  // for admin fordi koden ikke lenger står i nedtrekket.
  it("rydder bort sakstema og behandlingstema som ikke lenger er lovlige når sakstypen endres", async () => {
    render(<Vert start={{ sakstemaer: ["TRYGDEAVGIFT"], behandlingstemaer: ["ARBEID_KUN_NORGE"] }} />);

    await velg("Gjelder sakstype", "EU/EØS-land");

    expect(valg()).toEqual({ sakstyper: ["EU_EOS"], sakstemaer: [], behandlingstemaer: [] });
  });

  it("rydder bort behandlingstema som ikke lenger er lovlig når sakstemaet endres", async () => {
    render(<Vert start={{ behandlingstemaer: ["ARBEID_KUN_NORGE"] }} />);

    await velg("Gjelder sakstema", "Medlemskap og lovvalg");

    expect(valg()).toEqual({ sakstyper: [], sakstemaer: ["MEDLEMSKAP_LOVVALG"], behandlingstemaer: [] });
  });

  it("beholder valg lenger ned som fortsatt er lovlige", async () => {
    render(<Vert start={{ sakstemaer: ["TRYGDEAVGIFT"], behandlingstemaer: ["ARBEID_KUN_NORGE"] }} />);

    await velg("Gjelder sakstype", "Utenfor avtaleland");

    expect(valg()).toEqual({
      sakstyper: ["FTRL"],
      sakstemaer: ["TRYGDEAVGIFT"],
      behandlingstemaer: ["ARBEID_KUN_NORGE"],
    });
  });
});

describe("Kontekstavgrensning uten kombinasjonstre", () => {
  beforeEach(() => vi.clearAllMocks());

  // Avgrensningen er støyreduksjon: den skal kunne settes selv om kaskaden er utilgjengelig.
  it("faller tilbake på hele kodeverket og sier fra når treet ikke kan hentes", async () => {
    mocks.kombinasjonstre.mockReturnValue({ data: undefined, isError: true });

    render(<Vert />);

    expect(screen.getByText(/Klarte ikke å hente lovlige kombinasjoner/)).toBeDefined();

    await aapne("Gjelder sakstema");
    expect(opsjoner("Gjelder sakstema")).toEqual(["Medlemskap og lovvalg", "Unntak", "Trygdeavgift"]);
  });

  it("rydder ikke i valgene når kaskaden mangler", async () => {
    mocks.kombinasjonstre.mockReturnValue({ data: undefined, isError: true });

    render(<Vert start={{ behandlingstemaer: ["ARBEID_KUN_NORGE"] }} />);

    await velg("Gjelder sakstype", "EU/EØS-land");

    expect(valg().behandlingstemaer).toEqual(["ARBEID_KUN_NORGE"]);
  });
});
