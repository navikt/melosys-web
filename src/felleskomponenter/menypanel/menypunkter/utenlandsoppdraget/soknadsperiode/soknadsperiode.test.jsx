import { Soknadsperiode } from "./soknadsperiode";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";

vi.mock("../../../../../utils", async () => {
  const actual = await vi.importActual("../../../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("Soknadsperiode", () => {
  const props = {
    redigerbart: true,
    lagreSoknadOgOppfriskSaksopplysninger: vi.fn(),
    tittel: "Tittel",
  };

  const initialState = {
    mottatteOpplysninger: {
      status: "",
      data: {
        data: {
          periode: {
            fom: "2023-01-01",
            tom: "2023-04-01",
          },
        },
      },
    },
  };

  it("snapshot test", () => {
    const { container } = renderWithProviders(<Soknadsperiode {...props} />, { preloadedState: initialState });
    expect(container).toMatchSnapshot();
  });
});
