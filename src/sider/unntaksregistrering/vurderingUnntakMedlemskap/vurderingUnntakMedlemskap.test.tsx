import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MKV from "../../../melosyskodeverk";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { kontrollSelectors } from "../../../ducks/kontroll";
import { feiletResponsSelectors } from "../../../ducks/feiletRespons";

const { KONV_EFTA_STORBRITANNIA_ART14_1, KONV_EFTA_STORBRITANNIA_ART16_1 } =
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia;

const selectorVerdier = new Map<unknown, unknown>();

vi.mock("react-redux", () => ({ useSelector: (selector: unknown) => selectorVerdier.get(selector) }));
vi.mock("../../../hooks", () => ({ useDispatch: () => () => Promise.resolve() }));
vi.mock("../../../felleskomponenter/feilmeldinger", () => ({ Feilmeldinger: () => null }));
vi.mock("../../../services/api", () => ({
  Lovvalgsbestemmelser: {
    getLovvalgsbestemmelser: () =>
      Promise.resolve([
        {
          kode: KONV_EFTA_STORBRITANNIA_ART14_1,
          term: "Konv. EFTA Storbritannia art. 14 nr. 1 – Utsendt arbeidstaker",
        },
        {
          kode: KONV_EFTA_STORBRITANNIA_ART16_1,
          term: "Konv. EFTA Storbritannia art. 16 nr. 1 – Utsendt arbeidstaker til sokkel",
        },
      ]),
  },
  Saksflyt: { Unntaksregistrering: { registrerUnntakFraMedlemskap: vi.fn() } },
}));

import VurderingUnntakMedlemskap from "./vurderingUnntakMedlemskap";

const settOppState = (periode: { fom: string; tom: string }) => {
  selectorVerdier.set(redigerbartSelectors.RedigerbartSelector, true);
  selectorVerdier.set(behandlingerSelectors.BehandlingIDSelector, 1);
  selectorVerdier.set(fagsakSelectors.SakstypeKodeSelector, MKV.Koder.sakstyper.TRYGDEAVTALE);
  selectorVerdier.set(fagsakSelectors.SakstemaKodeSelector, MKV.Koder.sakstemaer.UNNTAK);
  selectorVerdier.set(
    behandlingerSelectors.BehandlingstemaKodeSelector,
    MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK,
  );
  selectorVerdier.set(mottatteOpplysningerSelectors.LovvalgslandSelector, MKV.Koder.landkoder.GB);
  selectorVerdier.set(mottatteOpplysningerSelectors.PeriodeSelector, periode);
  selectorVerdier.set(lovvalgsperioderSelectors.LovvalgsperiodeSelector, {});
  selectorVerdier.set(
    behandlingsresultatSelectors.UtfallRegistreringUnntakSelector,
    MKV.Koder.utfallregistreringunntak.GODKJENT,
  );
  selectorVerdier.set(feiletResponsSelectors.FeilmeldingerSelector, {});
  selectorVerdier.set(kontrollSelectors.KontrollFeilSelector, {});
};

const velgBestemmelse = async (term: string) => {
  render(<VurderingUnntakMedlemskap oppdaterStatus={vi.fn()} tilbake={vi.fn()} aktivtSteg />);
  await userEvent.click(await screen.findByRole("combobox", { name: "Bestemmelse" }));
  await userEvent.click(await screen.findByRole("option", { name: term }));
};

const bekreftKnapp = () => screen.getByRole("button", { name: "Bekreft og avslutt" });

describe("VurderingUnntakMedlemskap – konvensjonen med Storbritannia", () => {
  beforeEach(() => selectorVerdier.clear());

  it("viser info og feil, og deaktiverer bekreft, for utsending over 24 måneder med startdato før 2024", async () => {
    settOppState({ fom: "2023-01-01", tom: "2026-06-01" });

    await velgBestemmelse("Konv. EFTA Storbritannia art. 14 nr. 1 – Utsendt arbeidstaker");

    await waitFor(() => expect(screen.queryByText(/gjelder fra 1. januar 2024/)).not.toBeNull());
    expect(screen.getByText("Periodelengde er mer enn 24 måneder.")).toBeDefined();
    expect(bekreftKnapp()).toHaveProperty("disabled", true);
  });

  it("viser kun info for annen konvensjonsbestemmelse med startdato før 2024", async () => {
    settOppState({ fom: "2023-01-01", tom: "2026-06-01" });

    await velgBestemmelse("Konv. EFTA Storbritannia art. 16 nr. 1 – Utsendt arbeidstaker til sokkel");

    await waitFor(() => expect(screen.queryByText(/gjelder fra 1. januar 2024/)).not.toBeNull());
    expect(screen.queryByText("Periodelengde er mer enn 24 måneder.")).toBeNull();
  });

  it("viser ingen meldinger for utsending innenfor 24 måneder fra 2024", async () => {
    settOppState({ fom: "2024-01-01", tom: "2025-12-31" });

    await velgBestemmelse("Konv. EFTA Storbritannia art. 14 nr. 1 – Utsendt arbeidstaker");

    await waitFor(() => expect(screen.queryByText(/gjelder fra 1. januar 2024/)).toBeNull());
    expect(screen.queryByText("Periodelengde er mer enn 24 måneder.")).toBeNull();
  });
});
