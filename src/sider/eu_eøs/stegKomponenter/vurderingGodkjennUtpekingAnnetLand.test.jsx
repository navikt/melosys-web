import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MKV from "../../../melosyskodeverk";
import { VurderingGodkjennUtpekingAnnetLand } from "./vurderingGodkjennUtpekingAnnetLand";

vi.mock("../../../services/modules/kontroll", () => ({
  erBucAapen: () => Promise.resolve(true),
}));
vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));

describe("vurderingGodkjennUtpekingAnnetLand", () => {
  let props = null;

  beforeEach(() => {
    props = {
      lagreOgGodkjennUnntaksperioder: vi.fn(),
      tilbake: vi.fn(),
      redigerbart: true,
      overskrift: "Godkjenn utpeking",
      behandlingID: 4,
      vurderUtpekingFormValues: {
        fom: "12.12.2020",
        tom: "12.12.2021",
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
      },
    };
  });

  it("checkbox og fritekstfelt eksisterer og onchange metoder fungerer som forventet", async () => {
    render(<VurderingGodkjennUtpekingAnnetLand {...props} />);
    const user = userEvent.setup();
    await user.click(await screen.findByText("Send A012"));

    expect(screen.getByLabelText("Send A012")).toBeChecked();

    const input = screen.getByLabelText("Ytterligere informasjon til SED (valgfri)");
    fireEvent.change(input, { target: { value: "Fritekst her" } });

    expect(input.value).toBe("Fritekst her");
  });

  it("viser overskrift", async () => {
    render(<VurderingGodkjennUtpekingAnnetLand {...props} />);

    expect(await screen.findByText(props.overskrift)).toBeInTheDocument();
  });

  it("knapp er ikke disabled når redigerbar er true", async () => {
    render(<VurderingGodkjennUtpekingAnnetLand {...props} />);

    expect(await screen.findByText("Bekreft")).not.toBeDisabled();
  });
});
