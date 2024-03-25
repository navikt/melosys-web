import { render, screen } from "@testing-library/react";
import MKV from "../../../../melosyskodeverk";
import VurderingArtikkel13_2b from "./vurderingArtikkel13_2b";

vi.mock("../../../../utils", async () => {
  const actual = await vi.importActual("../../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});
vi.mock("nav-frontend-js-utils", async () => {
  const actual = await vi.importActual("nav-frontend-js-utils");
  return {
    ...actual,
    guid: () => "123",
  };
});

// TODO: Skriv om når aksel tas inn i prosjektet. MELOSYS-6021
/* eslint-disable react/jsx-pascal-case */
describe.skip("VurderingArtikkel13_2b", () => {
  const props = (omfattesILandFaktaKode = MKV.Koder.landkoder.CY) => ({
    tilstand: {
      omfattesILandFakta: {
        fakta: [omfattesILandFaktaKode],
      },
      harAvklaring: true,
    },
    redigerbart: true,
    oppdaterData: vi.fn(),
    slettData: vi.fn(),
    bekreftOgFortsett: vi.fn(),
    tilbake: vi.fn(),
  });

  it("snapshot test dersom Norge ikke er valgt", () => {
    const { container } = render(<VurderingArtikkel13_2b {...props()} />);
    expect(screen.getByText("Velg land:")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it("snapshot test dersom Norge er valgt", () => {
    const { container } = render(<VurderingArtikkel13_2b {...props(MKV.Koder.landkoder.NO)} />);
    expect(screen.queryByText("Velg land:")).toBeNull();
    expect(container).toMatchSnapshot();
  });
});
