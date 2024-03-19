import Lesmerpanel from "./lesmerpanel";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Lesmerpanel", () => {
  it("skal ikke vise lukketekst når er Aapen", async () => {
    const lesmerPanel = (
      <Lesmerpanel
        defaultApen
        onClose={vi.fn()}
        onOpen={vi.fn()}
        intro="Dette er intro"
        lukkTekst="lukketekst"
        apneTekst="aapnetekst"
      >
        {[<span key={1}>innholdstekst</span>]}
      </Lesmerpanel>
    );

    render(lesmerPanel);
    expect(screen.queryByText("aapnetekst")).not.toBeInTheDocument();
    expect(screen.getByText("lukketekst")).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button"));
    expect(screen.getByText("aapnetekst")).toBeInTheDocument();
    expect(screen.queryByText("lukketekst")).not.toBeInTheDocument();
  });
});
