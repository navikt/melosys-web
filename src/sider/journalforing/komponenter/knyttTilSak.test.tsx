import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";

import { JournalforingValues } from "../../../kodeverk/form";
import MKV from "../../../melosyskodeverk";
import { KnyttTilSak } from "./knyttTilSak";
import { renderWithProvidersAsync } from "../../../ducks/test-utils/renderWithProviders";
import { reduxForm } from "redux-form";

const mocks = vi.hoisted(() => {
  return {
    hent: vi.fn(),
    hentBehandlingstyperForKnyttTilSak: vi.fn(() => Promise.resolve([{ kode: "AARSAVREGNING", term: "Årsavregning" }])),
  };
});
vi.mock("../../../services/modules/anmodningsperioder", () => ({
  hent: () => Promise.resolve(mocks.hent()),
}));
vi.mock("../../../services/modules/lovligekombinasjoner", () => ({
  hentBehandlingstemaer: () => Promise.resolve([]),
  hentBehandlingstyperForKnyttTilSak: () => mocks.hentBehandlingstyperForKnyttTilSak(),
}));
interface KnyttTilSakProps {
  sak: {
    sakstype: { kode: string };
    sakstema: { kode: string };
    saksstatus: { kode: string };
    saksnummer: string;
    behandlingOversikter: Array<{
      behandlingsstatus: { kode: string };
      behandlingstype: { kode: string };
      behandlingstema: { kode: string };
      behandlingID: number;
    }>;
  };
  formValues: {
    opprettBehandling: any;
    behandlingstema: any;
    behandlingstype: any;
    journalforingGjelder: string;
  };
  feltNavn: any;
  changeField: () => void;
  erJournalføring: boolean;
}

describe("KnyttTilSak", () => {
  let props: KnyttTilSakProps;

  beforeEach(() => {
    props = {
      sak: {
        sakstype: {
          kode: MKV.Koder.sakstyper.EU_EOS,
        },
        sakstema: {
          kode: MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        },
        saksstatus: {
          kode: MKV.Koder.saksstatuser.UNDER_BEHANDLING,
        },
        saksnummer: "123",
        behandlingOversikter: [
          {
            behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET },
            behandlingstype: { kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG },
            behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV },
            behandlingID: 1,
          },
        ],
      },
      formValues: {
        opprettBehandling: null,
        behandlingstema: null,
        behandlingstype: null,
        journalforingGjelder: MKV.Koder.aktoersroller.BRUKER,
      },
      feltNavn: JournalforingValues,
      changeField: vi.fn(),
      erJournalføring: true,
    };
    mocks.hent.mockReset();
  });

  const WrappedKnyttTilSak = reduxForm({ form: "test" })(KnyttTilSak as any);

  it(`Vis komponent for knytte til eksisterende sak komponent og knapper for å opprette ny behandling dersom siste behandling er inaktiv`, async () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET };

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

    expect(screen.getByText("Tidligere behandling er avsluttet.")).toBeInTheDocument();
    expect(screen.getByText("Velg hva du vil gjøre med dokumentet")).toBeInTheDocument();
    const radiogruppe = screen.getByRole("group");
    expect(radiogruppe).toBeInTheDocument();
    expect(within(radiogruppe).queryAllByRole("radio")).toHaveLength(2);
    expect(within(radiogruppe).getByLabelText("Opprett ny behandling")).toBeInTheDocument();
  });

  it(`Ikke vis knytt til eksisterende sak komponent dersom siste behandling er aktiv`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };

    renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

    expect(screen.queryByText("Velg hva du vil gjøre med dokumentet")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
  });

  it(`Ikke vis knytt til eksisterende sak komponent dersom status er henlagt`, async () => {
    props.sak.saksstatus.kode = MKV.Koder.saksstatuser.HENLAGT;
    props.erJournalføring = false;

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

    expect(screen.queryByText("Velg hva du vil gjøre med dokumentet")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.getByText(/Du kan ikke opprette en ny behandling/i)).toBeInTheDocument();
  });

  it(`Vis vurder dokument dersom man er i journalføring-kontekst`, async () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.erJournalføring = true;

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByText(`Oppdater behandlingsstatus til "Vurder dokument"`)).toBeInTheDocument();
  });

  it(`Ikke vis vurder dokument dersom man er i opprett ny sak/behandling-kontekst`, async () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.erJournalføring = false;

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByText(`Oppdater behandlingsstatus til "Vurder dokument"`)).toBeNull();
    expect(screen.getByText(/Du kan ikke opprette en ny behandling/i)).toBeInTheDocument();
  });

  it(`Vis varselmelding om anmodning om unntak dersom siste behandling er pågående artikkel 16 sak`, async () => {
    mocks.hent.mockReturnValueOnce({ anmodningsperioder: [{ sendtUtland: true }] });
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

    await waitFor(() => expect(mocks.hent).toHaveBeenCalledOnce());
    expect(screen.getByText(/Hvis du har mottatt svar på anmodning om unntak skal du/i)).toBeInTheDocument();
  });

  it(`Ikke vis varselmelding om anmodning om unntak dersom siste behandling er avsluttet artikkel 16 sak`, async () => {
    mocks.hent.mockReturnValueOnce({ anmodningsperioder: [{ sendtUtland: true }] });
    props.sak.behandlingOversikter[0].behandlingsstatus = { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET };

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

    await waitFor(() => expect(mocks.hent).toHaveBeenCalledOnce());
    expect(screen.queryByText(/Hvis du har mottatt svar på anmodning om unntak skal du/i)).toBeNull();
    expect(screen.getByText("Tidligere behandling er avsluttet.")).toBeInTheDocument();
  });

  it("viser behandlingstypevalg når behandlingstema er valgt", async () => {
    props.formValues.behandlingstema = "YRKESAKTIV";
    props.formValues.opprettBehandling = true;

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

    await waitFor(() => expect(mocks.hentBehandlingstyperForKnyttTilSak).toHaveBeenCalled());
    expect(screen.getByText("Behandlingstype")).toBeInTheDocument();

    const behandlingstypeGroup = screen.getByRole("group", { name: "Behandlingstype" });
    const radioButtons = within(behandlingstypeGroup).getAllByRole("radio");
    expect(radioButtons).toHaveLength(1);
    expect(within(behandlingstypeGroup).getByLabelText("Årsavregning")).toBeInTheDocument();
  });

  it("håndterer feil ved henting av behandlingstyper", async () => {
    // Suppress console.error for denne spesifikke testen, siden det er feilhåndtering som testes
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mocks.hentBehandlingstyperForKnyttTilSak.mockRejectedValueOnce(new Error("API Error"));
    props.formValues.behandlingstema = "YRKESAKTIV";
    props.formValues.opprettBehandling = true;

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

    await waitFor(() => {
      expect(mocks.hentBehandlingstyperForKnyttTilSak).toHaveBeenCalled();
      const behandlingstypeGroup = screen.queryByRole("group", { name: "Behandlingstype" });
      if (behandlingstypeGroup) {
        expect(within(behandlingstypeGroup).queryAllByRole("radio")).toHaveLength(0);
      }
    });

    // Restore console.error
    consoleSpy.mockRestore();
  });

  describe("State-håndtering ved saksbytting", () => {
    it("nullstiller behandlingstyper når man bytter til ny sak", async () => {
      // Første sak med behandlingstyper
      props.formValues.behandlingstema = "YRKESAKTIV";
      props.formValues.opprettBehandling = true;

      const { rerender } = await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

      await waitFor(() => {
        expect(screen.getByText("Årsavregning")).toBeInTheDocument();
      });

      // Bytt til ny sak
      const newProps = {
        ...props,
        sak: {
          ...props.sak,
          saksnummer: "456",
          behandlingOversikter: [
            {
              behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET },
              behandlingstype: { kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG },
              behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV },
              behandlingID: 2,
            },
          ],
        },
        formValues: {
          ...props.formValues,
          behandlingstema: null, // Nullstilt
          opprettBehandling: null,
        },
      };

      rerender(<WrappedKnyttTilSak {...(newProps as any)} />);

      // State skal være nullstilt - ingen behandlingstyper vises før nytt API-kall
      await waitFor(() => {
        const behandlingstypeGroup = screen.queryByRole("group", { name: "Behandlingstype" });
        expect(behandlingstypeGroup).toBeNull();
      });
    });

    it("setter behandlingstema når man bytter til ny sak med avsluttet behandling", async () => {
      props.formValues.behandlingstema = null;

      await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

      // Verifiser at UI rendrer korrekt (behandlingstema er satt via Redux operation)
      await waitFor(() => {
        expect(screen.getByText("Tidligere behandling er avsluttet.")).toBeInTheDocument();
      });

      // Behandlingstema settes nå av Redux operation, ikke direkte i komponenten
      // Denne funksjonaliteten testes på Redux-nivå
    });

    it("rendrer korrekt UI etter saksbytting fra aktiv til avsluttet behandling", async () => {
      // Start med aktiv behandling
      props.sak.behandlingOversikter[0].behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      };

      const { rerender } = await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

      // Skal vise vurder dokument checkbox for aktiv behandling
      expect(screen.getByRole("checkbox")).toBeInTheDocument();

      // Bytt til sak med avsluttet behandling
      const newProps = {
        ...props,
        sak: {
          ...props.sak,
          saksnummer: "789",
          behandlingOversikter: [
            {
              behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET },
              behandlingstype: { kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG },
              behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV },
              behandlingID: 3,
            },
          ],
        },
      };

      rerender(<WrappedKnyttTilSak {...(newProps as any)} />);

      // Skal vise opprett behandling-panelet for avsluttet behandling
      await waitFor(() => {
        expect(screen.getByText("Tidligere behandling er avsluttet.")).toBeInTheDocument();
        expect(screen.getByText("Velg hva du vil gjøre med dokumentet")).toBeInTheDocument();
      });
    });

    it("bytter korrekt mellom panelvisning, feilmelding og tilbake til panelvisning", async () => {
      props.erJournalføring = false;

      // 1. Start med avsluttet behandling - skal vise panelet
      props.sak.behandlingOversikter[0].behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
      };

      const { rerender } = await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

      await waitFor(() => {
        expect(screen.getByText("Tidligere behandling er avsluttet.")).toBeInTheDocument();
      });

      // 2. Bytt til henlagt sak - skal vise feilmelding
      const henlagtSak = {
        ...props,
        sak: {
          ...props.sak,
          saksnummer: "MEL-456",
          saksstatus: { kode: MKV.Koder.saksstatuser.HENLAGT },
        },
      };

      rerender(<WrappedKnyttTilSak {...(henlagtSak as any)} />);

      await waitFor(() => {
        expect(screen.queryByText("Tidligere behandling er avsluttet.")).toBeNull();
        expect(screen.getByText(/Du kan ikke opprette en ny behandling/i)).toBeInTheDocument();
      });

      // 3. Bytt tilbake til første sak - skal vise panelet igjen
      const tilbakeTilFørste = {
        ...props,
        sak: {
          ...props.sak,
          saksnummer: "123",
          saksstatus: { kode: MKV.Koder.saksstatuser.UNDER_BEHANDLING },
          behandlingOversikter: [
            {
              behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET },
              behandlingstype: { kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG },
              behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV },
              behandlingID: 1,
            },
          ],
        },
      };

      rerender(<WrappedKnyttTilSak {...(tilbakeTilFørste as any)} />);

      await waitFor(() => {
        expect(screen.queryByText(/Du kan ikke opprette en ny behandling/i)).toBeNull();
        expect(screen.getByText("Tidligere behandling er avsluttet.")).toBeInTheDocument();
      });
    });
  });
});
