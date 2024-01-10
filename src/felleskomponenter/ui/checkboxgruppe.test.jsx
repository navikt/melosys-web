import MKV from "../../melosyskodeverk";

import Checkboxgruppe from "./checkboxgruppe";
import { render, screen } from "@testing-library/react";

vi.mock("../../utils", async () => {
  const actual = await vi.importActual("../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("Checkboxgruppe", () => {
  let props = null;

  beforeEach(() => {
    props = {
      legend: "Checkboxer",
      muligeValg: MKV.KTObjects.begrunnelser.arbeidsland,
      disabled: false,
      onChange: vi.fn(),
      defaultValg: [MKV.Koder.begrunnelser.arbeidsland.BASELAND],
    };
  });

  it("snapshot test", () => {
    const { container } = render(<Checkboxgruppe {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("setter disabled korrekt", () => {
    render(<Checkboxgruppe {...props} />);
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeDisabled();
    });
  });
});
