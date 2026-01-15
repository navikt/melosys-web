import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";

import { JournalforingValues } from "../../kodeverk/form";
import MKV from "../../melosyskodeverk";
import { KnyttTilSak, KnyttTilSakProps } from "./knyttTilSak";
import { renderWithProvidersAsync } from "../../ducks/test-utils/renderWithProviders";
import { reduxForm } from "redux-form";

const mocks = vi.hoisted(() => {
  return {
    hent: vi.fn(),
    hentBehandlingstyperForKnyttTilSak: vi.fn(() => Promise.resolve([{ kode: "AARSAVREGNING", term: "Årsavregning" }])),
    hentTrygdeavgiftOppsummering: vi.fn(() => Promise.resolve({ harBehandlingMedTrygdeavgift: false })),
  };
});
vi.mock("../../services/modules/anmodningsperioder", () => ({
  hent: () => Promise.resolve(mocks.hent()),
}));
vi.mock("../../services/modules/lovligekombinasjoner", () => ({
  hentBehandlingstemaer: () => Promise.resolve([]),
  hentBehandlingstyperForKnyttTilSak: () => mocks.hentBehandlingstyperForKnyttTilSak(),
}));
vi.mock("../../services/modules/fagsaker/fagsak", () => ({
  hentTrygdeavgiftOppsummering: () => mocks.hentTrygdeavgiftOppsummering(),
}));

describe("KnyttTilSak", () => {
  let props: KnyttTilSakProps;

  beforeEach(() => {
    props = {
      sak: {
        sakstype: {
          kode: MKV.Koder.sakstyper.EU_EOS,
          term: "EØS",
        },
        sakstema: {
          kode: MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
          term: "Medlemskap og lovvalg",
        },
        saksstatus: {
          kode: MKV.Koder.saksstatuser.UNDER_BEHANDLING,
          term: "Under behandling",
        },
        saksnummer: "123",
        behandlingOversikter: [
          {
            behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: "Avsluttet" },
            behandlingstype: {
              kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
              term: "Førstegangsbehandling",
            },
            behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" },
            behandlingID: 1,
            opprettetDato: "2024-01-01",
            behandlingsresultattype: { kode: "", term: "" },
            svarFrist: "",
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
    mocks.hentTrygdeavgiftOppsummering.mockReset();
    mocks.hentTrygdeavgiftOppsummering.mockReturnValue(Promise.resolve({ harBehandlingMedTrygdeavgift: false }));
  });

  const WrappedKnyttTilSak = reduxForm({ form: "test" })(KnyttTilSak as any);

  it(`Vis komponent for knytte til eksisterende sak komponent og knapper for å opprette ny behandling dersom siste behandling er inaktiv`, async () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
      term: "Avsluttet",
    };

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
      term: "Under behandling",
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
      term: "Under behandling",
    };
    props.erJournalføring = true;

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByText(`Oppdater behandlingsstatus til "Vurder dokument"`)).toBeInTheDocument();
  });

  it(`Ikke vis vurder dokument dersom man er i opprett ny sak/behandling-kontekst`, async () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: "Under behandling",
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
      term: "Under behandling",
    };

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

    await waitFor(() => expect(mocks.hent).toHaveBeenCalledOnce());
    expect(screen.getByText(/Hvis du har mottatt svar på anmodning om unntak skal du/i)).toBeInTheDocument();
  });

  it(`Ikke vis varselmelding om anmodning om unntak dersom siste behandling er avsluttet artikkel 16 sak`, async () => {
    mocks.hent.mockReturnValueOnce({ anmodningsperioder: [{ sendtUtland: true }] });
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
      term: "Avsluttet",
    };

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
              behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: "Avsluttet" },
              behandlingstype: {
                kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
                term: "Førstegangsbehandling",
              },
              behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" },
              behandlingID: 2,
              opprettetDato: "2024-01-01",
              behandlingsresultattype: { kode: "", term: "" },
              svarFrist: "",
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
        term: "Under behandling",
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
              behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: "Avsluttet" },
              behandlingstype: {
                kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
                term: "Førstegangsbehandling",
              },
              behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" },
              behandlingID: 3,
              opprettetDato: "2024-01-01",
              behandlingsresultattype: { kode: "", term: "" },
              svarFrist: "",
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
        term: "Avsluttet",
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
          saksstatus: { kode: MKV.Koder.saksstatuser.HENLAGT, term: "Henlagt" },
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
          saksstatus: { kode: MKV.Koder.saksstatuser.UNDER_BEHANDLING, term: "Under behandling" },
          behandlingOversikter: [
            {
              behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: "Avsluttet" },
              behandlingstype: {
                kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
                term: "Førstegangsbehandling",
              },
              behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" },
              behandlingID: 1,
              opprettetDato: "2024-01-01",
              behandlingsresultattype: { kode: "", term: "" },
              svarFrist: "",
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

  describe("Behandlingstema disabled ved årsavregning", () => {
    it("behandlingstema-dropdown er disabled når behandlingstype er årsavregning og saken har eksisterende behandlinger", async () => {
      props.formValues.opprettBehandling = true;
      props.formValues.behandlingstema = "YRKESAKTIV";
      props.formValues.behandlingstype = MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING;
      props.sak.behandlingOversikter[0].behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
        term: "Avsluttet",
      };

      await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

      await waitFor(() => {
        const behandlingstemaSelect = screen.getByLabelText("Behandlingstema");
        expect(behandlingstemaSelect).toBeDisabled();
      });
    });

    it("behandlingstema-dropdown er IKKE disabled når behandlingstype ikke er årsavregning", async () => {
      props.formValues.opprettBehandling = true;
      props.formValues.behandlingstema = "YRKESAKTIV";
      props.formValues.behandlingstype = MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
      props.sak.behandlingOversikter[0].behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
        term: "Avsluttet",
      };

      await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

      await waitFor(() => {
        const behandlingstemaSelect = screen.getByLabelText("Behandlingstema");
        expect(behandlingstemaSelect).not.toBeDisabled();
      });
    });

    it("viser riktig hjelpetekst når behandlingstema er disabled pga årsavregning", async () => {
      props.formValues.opprettBehandling = true;
      props.formValues.behandlingstema = "YRKESAKTIV";
      props.formValues.behandlingstype = MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING;
      props.sak.behandlingOversikter[0].behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
        term: "Avsluttet",
      };

      await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Du kan ikke endre behandlingstema for årsavregning når den har en eksisterende behandling.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("viser hjelpetekst om fakturaserie når saken har trygdeavgift", async () => {
      mocks.hentTrygdeavgiftOppsummering.mockReturnValueOnce(Promise.resolve({ harBehandlingMedTrygdeavgift: true }));

      props.formValues.opprettBehandling = true;
      props.formValues.behandlingstema = "YRKESAKTIV";
      props.sak.behandlingOversikter[0].behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
        term: "Avsluttet",
      };

      await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

      await waitFor(() => {
        const behandlingstemaSelect = screen.getByLabelText("Behandlingstema");
        expect(behandlingstemaSelect).toBeDisabled();
        expect(
          screen.getByText("Du kan ikke endre behandlingstema når saken har en tilknyttet fakturaserie."),
        ).toBeInTheDocument();
      });
    });

    it("arver behandlingstema automatisk fra siste behandling når årsavregning velges", async () => {
      // Start med opprettBehandling=true og behandlingstype=null (ikke årsavregning ennå)
      props.formValues.opprettBehandling = true;
      props.formValues.behandlingstema = "PENSJONIST"; // Bruker har valgt et annet tema først
      props.formValues.behandlingstype = MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING; // Ikke årsavregning
      props.sak.behandlingOversikter[0].behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
        term: "Avsluttet",
      };
      // Siste behandling har behandlingstema YRKESAKTIV
      props.sak.behandlingOversikter[0].behandlingstema = {
        kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
        term: "Yrkesaktiv",
      };

      const { rerender } = await renderWithProvidersAsync(<WrappedKnyttTilSak {...(props as any)} />);

      // Vent på at komponenten er ferdig lastet
      await waitFor(() => {
        expect(screen.getByLabelText("Behandlingstema")).toBeInTheDocument();
      });

      // Reset mock for å kun sjekke kall etter bruker-interaksjon
      (props.changeField as ReturnType<typeof vi.fn>).mockClear();

      // Simuler at bruker bytter behandlingstype til "Årsavregning"
      const updatedProps = {
        ...props,
        formValues: {
          ...props.formValues,
          opprettBehandling: true,
          behandlingstema: "PENSJONIST", // Fortsatt feil verdi - skal overskrives
          behandlingstype: MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING,
        },
      };

      rerender(<WrappedKnyttTilSak {...(updatedProps as any)} />);

      // Verifiser at changeField ble kalt med behandlingstema fra siste behandling
      await waitFor(() => {
        expect(props.changeField).toHaveBeenCalledWith(
          JournalforingValues.formNavn,
          JournalforingValues.behandlingstema,
          MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
        );
      });
    });
  });
});
