import { screen } from "@testing-library/react";
import MKV from "../../../melosyskodeverk";
import { renderWithProviders, renderWithProvidersAsync } from "../../../ducks/test-utils/renderWithProviders";
import AvsluttSak from "./avsluttsak";
import { beforeEach, vi } from "vitest";
import { useFeatureToggle } from "../../../featuretoggle";

const {
  YRKESAKTIV,
  UTSENDT_ARBEIDSTAKER,
  ANMODNING_OM_UNNTAK_HOVEDREGEL,
  REGISTRERING_UNNTAK,
  A1_ANMODNING_OM_UNNTAK_PAPIR,
  ARBEID_FLERE_LAND,
} = MKV.Koder.behandlinger.behandlingstema;
const { NY_VURDERING, FØRSTEGANG, HENVENDELSE, KLAGE } = MKV.Koder.behandlinger.behandlingstyper;
const { FTRL, TRYGDEAVTALE, EU_EOS } = MKV.Koder.sakstyper;
const { MEDLEMSKAP_LOVVALG, UNNTAK } = MKV.Koder.sakstemaer;

vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));

describe("AvsluttSak", () => {
  const props = {
    redigerbart: true,
    sakstype: "",
    sakstema: "",
    behandlingstema: "",
    behandlingstype: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    props.redigerbart = true;
    props.sakstype = EU_EOS;
    props.sakstema = MEDLEMSKAP_LOVVALG;
    props.behandlingstema = UTSENDT_ARBEIDSTAKER;
    props.behandlingstype = FØRSTEGANG;
  });

  const initialState = () => ({
    behandlinger: {
      status: "",
      data: {
        redigerbart: props.redigerbart,
        oppsummering: {
          behandlingstema: {
            kode: props.behandlingstema,
          },
          behandlingstype: {
            kode: props.behandlingstype,
          },
        },
      },
    },
    fagsaker: {
      status: "",
      data: {
        sakstype: {
          kode: props.sakstype,
        },
        sakstema: {
          kode: props.sakstema,
        },
      },
    },
  });

  it("viser riktige valg for sakstype FTRL og behandlingstype FØRSTEGANG ", async () => {
    props.sakstype = FTRL;
    props.behandlingstema = YRKESAKTIV;
    await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

    const knapper = await screen.findAllByRole("button");
    expect(knapper).toHaveLength(6);
    expect(knapper.at(0)?.textContent).toBe("Søknaden er innvilget");
    expect(knapper.at(1)?.textContent).toBe("Søknaden er avslått");
    expect(knapper.at(2)?.textContent).toBe("Avslå søknad pga. manglende opplysninger");
    expect(knapper.at(3)?.textContent).toBe("Ferdigbehandlet");
    expect(knapper.at(4)?.textContent).toBe("Søknaden/klagen er trukket");
    expect(knapper.at(5)?.textContent).toBe("Behandlingen er bortfalt");
  });

  it("viser riktige valg for sakstype FTRL og behandlingstype NY_VURDERING - Toggle av", async () => {
    props.sakstype = FTRL;
    props.behandlingstema = YRKESAKTIV;
    props.behandlingstype = NY_VURDERING;
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

    const knapper = await screen.findAllByRole("button");
    expect(knapper).toHaveLength(8);
    expect(knapper.at(0)?.textContent).toBe("Søknaden er innvilget");
    expect(knapper.at(1)?.textContent).toBe("Søknaden er avslått");
    expect(knapper.at(2)?.textContent).toBe("Avslå søknad pga. manglende opplysninger");
    expect(knapper.at(3)?.textContent).toBe("Vedtaket er omgjort (fvl § 35)");
    expect(knapper.at(4)?.textContent).toBe("Saken er annullert");
    expect(knapper.at(5)?.textContent).toBe("Ferdigbehandlet");
    expect(knapper.at(6)?.textContent).toBe("Søknaden/klagen er trukket");
    expect(knapper.at(7)?.textContent).toBe("Behandlingen er bortfalt");
  });

  it("viser riktige valg for sakstype FTRL og behandlingstype NY_VURDERING - Toggle på", async () => {
    props.sakstype = FTRL;
    props.behandlingstema = YRKESAKTIV;
    props.behandlingstype = NY_VURDERING;
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

    const knapper = await screen.findAllByRole("button");
    expect(knapper).toHaveLength(7);
    expect(knapper.at(0)?.textContent).toBe("Søknaden er innvilget");
    expect(knapper.at(1)?.textContent).toBe("Søknaden er avslått");
    expect(knapper.at(2)?.textContent).toBe("Avslå søknad pga. manglende opplysninger");
    expect(knapper.at(3)?.textContent).toBe("Vedtaket er omgjort (fvl § 35)");
    expect(knapper.at(4)?.textContent).toBe("Ferdigbehandlet");
    expect(knapper.at(5)?.textContent).toBe("Søknaden/klagen er trukket");
    expect(knapper.at(6)?.textContent).toBe("Behandlingen er bortfalt");
  });

  it("viser ingenting når behandling er ikke redigerbart", async () => {
    props.redigerbart = false;
    const { container } = renderWithProviders(<AvsluttSak />, { preloadedState: initialState() });

    expect(container).toBeEmptyDOMElement();
  });

  describe("Behandlingen er bortfalt", () => {
    it("viser Behandlingen er bortfalt når behandling er redigerbart", async () => {
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Behandlingen er bortfalt")).toBeInTheDocument();
    });
  });

  describe("Ferdigbehandlet", () => {
    it(`viser 'Ferdigbehandlet' dersom behandlingstema er blant de tillatte og behandlingstype er ${NY_VURDERING}`, async () => {
      props.behandlingstype = NY_VURDERING;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Ferdigbehandlet")).toBeInTheDocument();
    });

    it(`viser 'Ferdigbehandlet' dersom behandlingstema er blant de tillatte og behandlingstype er ${HENVENDELSE}`, async () => {
      props.behandlingstype = HENVENDELSE;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Ferdigbehandlet")).toBeInTheDocument();
    });

    it(`viser 'Ferdigbehandlet' dersom behandlingstema ikke er blant de tillatte så lenge behandling er redigerbart`, async () => {
      props.behandlingstema = YRKESAKTIV;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Ferdigbehandlet")).toBeInTheDocument();
    });

    it(`viser 'Ferdigbehandlet' dersom behandlingstema er ARBEID_FLERE_LAND, sakstype er EU_SØS, behandlingstype er FØRSTEGANG og det er redigerbart`, async () => {
      props.behandlingstema = ARBEID_FLERE_LAND;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Ferdigbehandlet")).toBeInTheDocument();
    });

    it(`viser ikke 'Ferdigbehandlet' dersom behandlingstema er annet enn ARBEID_FLERE_LAND, behandlingstype er FØRSTEGANG og det er redigerbart`, async () => {
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(screen.queryByText("Ferdigbehandlet")).toBeNull();
    });
  });

  describe("Søknaden er avslått", () => {
    it(`viser 'Søknaden er avslått' dersom behandlingstype og behandlingstema er blant de tillatte`, async () => {
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Søknaden er avslått")).toBeInTheDocument();
    });

    it(`viser ikke 'Søknaden er avslått' dersom behandlingstype er ${HENVENDELSE}`, async () => {
      props.behandlingstype = HENVENDELSE;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Søknaden er avslått")).toBeFalsy();
    });

    it(`viser ikke 'Søknaden er avslått' dersom sakstema er ${UNNTAK}`, async () => {
      props.sakstema = UNNTAK;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Søknaden er avslått")).toBeFalsy();
    });
  });

  describe("Søknaden er innvilget", () => {
    it(`viser 'Søknaden er innvilget' dersom sakstype er ${EU_EOS} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${UTSENDT_ARBEIDSTAKER}`, async () => {
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Søknaden er innvilget")).toBeInTheDocument();
    });

    it(`viser 'Søknaden er innvilget' dersom sakstype er ${FTRL} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, async () => {
      props.sakstype = FTRL;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Søknaden er innvilget")).toBeInTheDocument();
    });

    it(`viser 'Søknaden er innvilget' dersom sakstype er ${TRYGDEAVTALE} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, async () => {
      props.sakstype = TRYGDEAVTALE;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Søknaden er innvilget")).toBeInTheDocument();
    });

    it(`viser ikke 'Søknaden er innvilget' dersom sakstype er ${TRYGDEAVTALE} og behandlingstype er ${HENVENDELSE} og behandlingstema er ${YRKESAKTIV}`, async () => {
      props.sakstype = TRYGDEAVTALE;
      props.behandlingstype = HENVENDELSE;
      props.behandlingstema = YRKESAKTIV;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Søknaden er innvilget")).toBeFalsy();
    });

    it(`viser ikke 'Søknaden er innvilget' dersom sakstema er ${UNNTAK}`, async () => {
      props.sakstema = UNNTAK;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Søknaden er innvilget")).toBeFalsy();
    });
  });

  describe("Søknaden/klagen er trukket", () => {
    it(`viser 'Søknaden/klagen er trukket' dersom sakstype er ${EU_EOS} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${UTSENDT_ARBEIDSTAKER}`, async () => {
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Søknaden/klagen er trukket")).toBeInTheDocument();
    });

    it(`viser 'Søknaden/klagen er trukket' dersom sakstype er ${FTRL} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, async () => {
      props.sakstype = FTRL;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Søknaden/klagen er trukket")).toBeInTheDocument();
    });

    it(`viser 'Søknaden/klagen er trukket' dersom sakstype er ${TRYGDEAVTALE} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, async () => {
      props.sakstype = TRYGDEAVTALE;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Søknaden/klagen er trukket")).toBeInTheDocument();
    });

    it(`viser ikke 'Søknaden/klagen er trukket' dersom sakstype er ${TRYGDEAVTALE} og behandlingstype er ${HENVENDELSE} og behandlingstema er ${YRKESAKTIV}`, async () => {
      props.sakstype = TRYGDEAVTALE;
      props.behandlingstype = HENVENDELSE;
      props.behandlingstema = YRKESAKTIV;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Søknaden/klagen er trukket")).toBeFalsy();
    });

    it(`viser ikke 'Søknaden/klagen er trukket' dersom sakstema er ${UNNTAK}`, async () => {
      props.sakstema = UNNTAK;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Søknaden/klagen er trukket")).toBeFalsy();
    });
  });

  describe("Avslå søknad pga. manglende opplysninger", () => {
    it(`viser 'Avslå søknad pga. manglende opplysninger' dersom sakstype er ${EU_EOS} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${UTSENDT_ARBEIDSTAKER}`, async () => {
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Avslå søknad pga. manglende opplysninger")).toBeInTheDocument();
    });

    it(`viser 'Avslå søknad pga. manglende opplysninger' dersom sakstype er ${FTRL} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, async () => {
      props.sakstype = FTRL;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Avslå søknad pga. manglende opplysninger")).toBeInTheDocument();
    });

    it(`viser 'Avslå søknad pga. manglende opplysninger' dersom sakstype er ${TRYGDEAVTALE} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, async () => {
      props.sakstype = TRYGDEAVTALE;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Avslå søknad pga. manglende opplysninger")).toBeInTheDocument();
    });

    it(`viser ikke 'Avslå søknad pga. manglende opplysninger' dersom sakstype er ${TRYGDEAVTALE} og behandlingstype er ${HENVENDELSE} og behandlingstema er ${YRKESAKTIV}`, async () => {
      props.sakstype = TRYGDEAVTALE;
      props.behandlingstype = HENVENDELSE;
      props.behandlingstema = YRKESAKTIV;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Avslå søknad pga. manglende opplysninger")).toBeFalsy();
    });

    it(`viser ikke 'Avslå søknad pga. manglende opplysninger' dersom sakstema er ${UNNTAK}`, async () => {
      props.sakstema = UNNTAK;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Avslå søknad pga. manglende opplysninger")).toBeFalsy();
    });
  });

  describe("Klage-handlinger", () => {
    it(`viser Klage-handlinger dersom behandlingstype er ${KLAGE}`, async () => {
      props.behandlingstype = KLAGE;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Medhold på klage")).toBeTruthy();
      expect(
        knapper.some((knapp) => knapp.textContent === "Klageinnstilling er oversendt til klageinstansen"),
      ).toBeTruthy();
      expect(knapper.some((knapp) => knapp.textContent === "Klage er avvist")).toBeTruthy();
    });

    it(`viser ikke Klage-handlinger dersom behandlingstype er ${FØRSTEGANG}`, async () => {
      props.behandlingstype = FØRSTEGANG;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Medhold på klage")).toBeFalsy();
      expect(
        knapper.some((knapp) => knapp.textContent === "Klageinnstilling er oversendt til klageinstansen"),
      ).toBeFalsy();
      expect(knapper.some((knapp) => knapp.textContent === "Klage er avvist")).toBeFalsy();
    });
  });

  describe("Vedtaket er omgjort (fvl § 35)", () => {
    it(`viser 'Vedtaket er omgjort (fvl § 35)' dersom behandlingstype er ${NY_VURDERING}`, async () => {
      props.behandlingstype = NY_VURDERING;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      expect(await screen.findByText("Vedtaket er omgjort (fvl § 35)")).toBeInTheDocument();
    });

    it(`viser ikke 'Vedtaket er omgjort (fvl § 35)' dersom behandlingstype er ${FØRSTEGANG}`, async () => {
      props.behandlingstype = FØRSTEGANG;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Vedtaket er omgjort (fvl § 35)")).toBeFalsy();
    });
  });

  describe("Unntak-handlinger", () => {
    it(`viser Unntak-handlinger dersom behandlingstema er ${ANMODNING_OM_UNNTAK_HOVEDREGEL} og sakstype er ${TRYGDEAVTALE}`, async () => {
      props.behandlingstema = ANMODNING_OM_UNNTAK_HOVEDREGEL;
      props.sakstype = TRYGDEAVTALE;
      props.sakstema = UNNTAK;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Perioden er godkjent")).toBeTruthy();
      expect(knapper.some((knapp) => knapp.textContent === "Perioden er delvis godkjent")).toBeTruthy();
      expect(knapper.some((knapp) => knapp.textContent === "Medlem i folketrygden")).toBeTruthy();
    });

    it(`viser Unntak-handlinger dersom behandlingstema er ${REGISTRERING_UNNTAK} og sakstype er ${TRYGDEAVTALE}`, async () => {
      props.behandlingstema = REGISTRERING_UNNTAK;
      props.sakstype = TRYGDEAVTALE;
      props.sakstema = UNNTAK;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Perioden er godkjent")).toBeTruthy();
      expect(knapper.some((knapp) => knapp.textContent === "Perioden er delvis godkjent")).toBeTruthy();
      expect(knapper.some((knapp) => knapp.textContent === "Medlem i folketrygden")).toBeTruthy();
    });

    it(`viser Unntak-handlinger dersom behandlingstema er ${A1_ANMODNING_OM_UNNTAK_PAPIR} og sakstype er ${EU_EOS}`, async () => {
      props.behandlingstema = A1_ANMODNING_OM_UNNTAK_PAPIR;
      props.sakstype = EU_EOS;
      props.sakstema = UNNTAK;
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Perioden er godkjent")).toBeTruthy();
      expect(knapper.some((knapp) => knapp.textContent === "Perioden er delvis godkjent")).toBeTruthy();
      expect(knapper.some((knapp) => knapp.textContent === "Medlem i folketrygden")).toBeTruthy();
    });

    it(`viser ikke Unntak-handlinger for andre tilfeller enn de ovenfor`, async () => {
      await renderWithProvidersAsync(<AvsluttSak />, { preloadedState: initialState() });

      const knapper = await screen.findAllByRole("button");
      expect(knapper.some((knapp) => knapp.textContent === "Perioden er godkjent")).toBeFalsy();
      expect(knapper.some((knapp) => knapp.textContent === "Perioden er delvis godkjent")).toBeFalsy();
      expect(knapper.some((knapp) => knapp.textContent === "Medlem i folketrygden")).toBeFalsy();
    });
  });
});
