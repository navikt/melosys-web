import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { queryByAttribute } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import React from "react";

import MKV from "../../../../melosyskodeverk";

import Journalforingform from "./journalforingform";
import { renderWithProviders, renderWithProvidersAsync } from "../../../../ducks/test-utils/renderWithProviders";
import { testReduxState } from "./testReduxState";

const { EU_EOS, TRYGDEAVTALE, FTRL } = MKV.Terms.sakstyper;
const { MEDLEMSKAP_LOVVALG, UNNTAK, TRYGDEAVGIFT } = MKV.Terms.sakstemaer;
const { YRKESAKTIV, ANMODNING_OM_UNNTAK_HOVEDREGEL, PENSJONIST, IKKE_YRKESAKTIV } =
  MKV.Terms.behandlinger.behandlingstema;
const { FØRSTEGANG, NY_VURDERING, HENVENDELSE, KLAGE } = MKV.Terms.behandlinger.behandlingstyper;

vi.mock("../../../../services/modules/anmodningsperioder", async () => ({
  send: () => Promise.resolve(),
  hent: () => Promise.resolve(),
}));

vi.mock("../../../../services/modules/kontroll", async () => {
  const actual = await vi.importActual("../../../../services/modules/kontroll");
  return {
    ...actual,
    kontrollerAdresse: () => Promise.resolve({ kontrollfeilList: [] }),
  };
});

vi.mock("../../../../graphql/navn", () => ({
  hentSammensattNavn: () => Promise.resolve("KARAFFEL TRIVIELL"),
}));

vi.mock("../../../../services/modules/fagsaker/sok", () => ({
  send: () => Promise.resolve(testReduxState.sok.data.fagsakListe),
}));

vi.mock("../../../../services/modules/organisasjoner", () => ({
  hentOrganisasjon: () =>
    Promise.resolve({
      orgnr: "999999999",
      navn: "Ståles Stål AS",
      oppstartdato: null,
      organisasjonsform: "Aksjeselskap",
      forretningsadresse: {
        gateadresse: {
          gatenavn: "Adresselinje1",
          gatenummer: null,
          husnummer: null,
          husbokstav: null,
        },
        postnr: "0010",
        poststed: "Oslo",
        land: "NORGE",
      },
      postadresse: {
        gateadresse: {
          gatenavn: "Adresselinje1",
          gatenummer: null,
          husnummer: null,
          husbokstav: null,
        },
        postnr: "0010",
        poststed: "Oslo",
        land: "NORGE",
      },
    }),
}));

vi.mock("../../../../services/modules/lovligekombinasjoner", async () => {
  const actual = await vi.importActual("../../../../services/modules/lovligekombinasjoner");
  return {
    ...actual,
    hentSakstyper: () =>
      Promise.resolve([
        { kode: "EU_EOS", term: EU_EOS },
        { kode: "TRYGDEAVTALE", term: TRYGDEAVTALE },
        { kode: "FTRL", term: FTRL },
      ]),
    hentSakstemaer: () =>
      Promise.resolve([
        { kode: "MEDLEMSKAP_LOVVALG", term: MEDLEMSKAP_LOVVALG },
        { kode: "UNNTAK", term: UNNTAK },
        { kode: "TRYGDEAVGIFT", term: TRYGDEAVGIFT },
      ]),
    hentBehandlingstemaer: () =>
      Promise.resolve([
        { kode: "YRKESAKTIV", term: "Yrkesaktiv" },
        { kode: "ANMODNING_OM_UNNTAK_HOVEDREGEL", term: ANMODNING_OM_UNNTAK_HOVEDREGEL },
        { kode: "PENSJONIST", term: PENSJONIST },
        { kode: "IKKE_YRKESAKTIV", term: IKKE_YRKESAKTIV },
      ]),
    hentBehandlingstyper: () =>
      Promise.resolve([
        { kode: "FØRSTEGANG", term: FØRSTEGANG },
        { kode: "NY_VURDERING", term: NY_VURDERING },
        { kode: "HENVENDELSE", term: HENVENDELSE },
        { kode: "KLAGE", term: KLAGE },
      ]),
    hentBehandlingstyperForKnyttTilSak: () =>
      Promise.resolve([
        { kode: "FØRSTEGANG", term: FØRSTEGANG },
        { kode: "NY_VURDERING", term: NY_VURDERING },
        { kode: "HENVENDELSE", term: HENVENDELSE },
        { kode: "KLAGE", term: KLAGE },
      ]),
  };
});

describe("JournalforingForm", () => {
  let props = null;
  const getById = queryByAttribute.bind(null, "id");

  beforeEach(() => {
    props = {
      journalpostID: "1234",
      hoveddokumentID: "12345",
      hoveddokumentTittel: "Test",
      vedlegg: [],
      submitSpinner: false,
      submitJournalforing: vi.fn(),
      avbrytJournalforing: vi.fn(),
      settFeltInnhold: vi.fn(),
    };
  });

  it("sending av forvaltningsmelding vises for sakstema MEDLEMSKAP_LOVVALG og behandlingstype FØRSTEGANG", async () => {
    const { findByLabelText, getByText } = renderWithProviders(<Journalforingform {...props} />, {
      preloadedState: testReduxState,
    });
    const user = userEvent.setup();

    await user.click(await findByLabelText("Opprett ny sak"));
    await userEvent.selectOptions(await findByLabelText("Sakstype"), FTRL);
    await userEvent.selectOptions(await findByLabelText("Sakstema"), MEDLEMSKAP_LOVVALG);
    await userEvent.selectOptions(await findByLabelText("Behandlingstema"), YRKESAKTIV);
    await userEvent.selectOptions(await findByLabelText("Behandlingstype"), FØRSTEGANG);

    expect(getByText("Melding om saksbehandlingstid")).toBeInTheDocument();
  });

  it("sending av forvaltningsmelding vises IKKE for behandlingstype FØRSTEGANG og sakstema TRYGDEAVGIFT", async () => {
    const { findByLabelText, queryByText } = renderWithProviders(<Journalforingform {...props} />, {
      preloadedState: testReduxState,
    });
    const user = userEvent.setup();

    await user.click(await findByLabelText("Opprett ny sak"));
    await userEvent.selectOptions(await findByLabelText("Sakstype"), FTRL);
    await userEvent.selectOptions(await findByLabelText("Sakstema"), TRYGDEAVGIFT);
    await userEvent.selectOptions(await findByLabelText("Behandlingstema"), YRKESAKTIV);
    await userEvent.selectOptions(await findByLabelText("Behandlingstype"), FØRSTEGANG);

    expect(queryByText("Melding om saksbehandlingstid")).not.toBeInTheDocument();
  });

  it("sending av forvaltningsmelding vises IKKE for behandlingstype FØRSTEGANG og sakstema UNNTAK", async () => {
    const { findByLabelText, queryByText } = renderWithProviders(<Journalforingform {...props} />, {
      preloadedState: testReduxState,
    });
    const user = userEvent.setup();

    await user.click(await findByLabelText("Opprett ny sak"));
    await userEvent.selectOptions(await findByLabelText("Sakstype"), FTRL);
    await userEvent.selectOptions(await findByLabelText("Sakstema"), UNNTAK);
    await userEvent.selectOptions(await findByLabelText("Behandlingstema"), YRKESAKTIV);
    await userEvent.selectOptions(await findByLabelText("Behandlingstype"), FØRSTEGANG);

    expect(queryByText("Melding om saksbehandlingstid")).not.toBeInTheDocument();
  });

  it("sending av forvaltningsmelding vises ikke når man journalfører på virksomhet", async () => {
    const { findByLabelText, getByLabelText, queryByText, findByText } = renderWithProviders(
      <Journalforingform {...props} />,
      { preloadedState: testReduxState },
    );
    const user = userEvent.setup();

    await user.click(await findByLabelText("Virksomhet"));
    const orgnrInput = await findByLabelText("Org.nr.");
    fireEvent.change(orgnrInput, { target: { value: "999999999" } });
    expect(await findByText("Ståles Stål AS")).toBeInTheDocument();
    await user.click(getByLabelText("Opprett ny sak"));
    await userEvent.selectOptions(await findByLabelText("Sakstype"), FTRL);
    await userEvent.selectOptions(await findByLabelText("Sakstema"), MEDLEMSKAP_LOVVALG);
    await userEvent.selectOptions(await findByLabelText("Behandlingstema"), YRKESAKTIV);
    await userEvent.selectOptions(await findByLabelText("Behandlingstype"), FØRSTEGANG);

    expect(queryByText("Melding om saksbehandlingstid")).not.toBeInTheDocument();
  });

  it("skalTilordnes vises når vi oppretter sak", async () => {
    const { findByLabelText, getByLabelText } = renderWithProviders(<Journalforingform {...props} />, {
      preloadedState: testReduxState,
    });
    const user = userEvent.setup();

    await user.click(await findByLabelText("Opprett ny sak"));
    expect(getByLabelText("Legg behandlingen i mine oppgaver")).toBeInTheDocument();
  });

  it("skalTilordnes vises før vi velger sak", async () => {
    const { getByLabelText } = await renderWithProvidersAsync(<Journalforingform {...props} />, {
      preloadedState: testReduxState,
    });

    expect(getByLabelText("Legg behandlingen i mine oppgaver")).toBeInTheDocument();
  });

  it("skalTilordnes vises ikke når sak har saksstatus HENLAGT", async () => {
    const { container, findByLabelText, queryByLabelText } = renderWithProviders(<Journalforingform {...props} />, {
      preloadedState: testReduxState,
    });
    const user = userEvent.setup();

    await user.click(await findByLabelText("Eksisterende sak"));
    await user.click(await getById(container, "saksnummer-MEL-26"));
    expect(queryByLabelText("Legg behandlingen i mine oppgaver")).not.toBeInTheDocument();
  });

  it("skalTilordnes vises ikke når sak har saksstatus HENLAGT_BORFALT", async () => {
    const { container, findByLabelText, queryByLabelText } = renderWithProviders(<Journalforingform {...props} />, {
      preloadedState: testReduxState,
    });
    const user = userEvent.setup();

    await user.click(await findByLabelText("Eksisterende sak"));
    await user.click(await getById(container, "saksnummer-MEL-27"));
    expect(queryByLabelText("Legg behandlingen i mine oppgaver")).not.toBeInTheDocument();
  });

  it("sending av forvaltningsmelding vises når man knytter til sak sakstema MEDLEMSKAP_LOVVALG og behandling NY_VURDERING", async () => {
    const { container, findByLabelText, getByText } = renderWithProviders(<Journalforingform {...props} />, {
      preloadedState: testReduxState,
    });
    const user = userEvent.setup();

    await user.click(await findByLabelText("Eksisterende sak"));
    await user.click(await getById(container, "saksnummer-MEL-23"));
    await user.click(await findByLabelText(NY_VURDERING));
    expect(getByText("Melding om saksbehandlingstid")).toBeInTheDocument();
  });

  it("sending av forvaltningsmelding vises ikke når man knytter til sak sakstema MEDLEMSKAP_LOVVALG og behandlingstype KLAGE", async () => {
    const { container, findByLabelText, queryByText } = renderWithProviders(<Journalforingform {...props} />, {
      preloadedState: testReduxState,
    });
    const user = userEvent.setup();

    await user.click(await findByLabelText("Eksisterende sak"));
    await user.click(await getById(container, "saksnummer-MEL-23"));
    await user.click(await findByLabelText(KLAGE));
    expect(queryByText("Melding om saksbehandlingstid")).not.toBeInTheDocument();
  });
});
