import { ArbeidsgivereNorge } from "./arbeidsgivereNorge";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

vi.mock("../../../../utils", async () => {
  const actual = await vi.importActual("../../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("ArbeidsgivereNorge", () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      arbeidsgivereNorge: [
        {
          organisasjon: { orgnr: "123" },
          arbeidsforhold: [],
          inntektListe: [],
          arbeidsforholdene: [],
        },
      ],
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<ArbeidsgivereNorge {...props} />);
    expect(container).toMatchSnapshot();
  });
});
