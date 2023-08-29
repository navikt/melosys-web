import { Faktura } from "./faktura";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

vi.mock("../../../../utils", async () => {
  const actual = await vi.importActual("../../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("Faktura", () => {
  let props = null;

  beforeEach(() => {
    props = {
      faktura: {
        datoBestilt: "2023-08-24",
        fakturaLinje: [],
        id: 1,
        periodeFra: "2023-04-01",
        periodeTil: "2023-08-31",
        status: "BESTILLT",
      },
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<Faktura {...props} />);

    expect(container).toMatchSnapshot();
  });
});
