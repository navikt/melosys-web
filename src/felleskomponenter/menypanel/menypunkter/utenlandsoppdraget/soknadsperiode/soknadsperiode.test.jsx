import { Soknadsperiode } from "./soknadsperiode";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

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

  it("snapshot test når periode endres", async () => {
    const { container } = renderWithProviders(<Soknadsperiode {...props} />, { preloadedState: initialState });

    expect(screen.queryAllByRole("button")).toHaveLength(1);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));

    expect(container).toMatchSnapshot();
  });
});
