import { ArbeidsgivereNorge } from "./arbeidsgivereNorge";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

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
